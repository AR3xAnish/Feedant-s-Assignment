const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('../src/app');
const Competition = require('../src/models/Competition');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');
const Submission = require('../src/models/Submission');

describe('Competition Details & Registration Business Logic Test Suite', () => {
  let replSet;
  let testUser1;
  let testUser2;
  let testComp;

  beforeAll(async () => {
    // Spin up an in-memory MongoDB replica set so primary multi-document transactions can be tested
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();
    await mongoose.connect(uri);
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (replSet) {
      await replSet.stop();
    }
  }, 60000);

  beforeEach(async () => {
    await User.deleteMany({});
    await Competition.deleteMany({});
    await Registration.deleteMany({});
    await Submission.deleteMany({});

    testUser1 = await User.create({
      name: 'Test Participant 1',
      email: 'participant1@feedants.test',
    });

    testUser2 = await User.create({
      name: 'Test Participant 2',
      email: 'participant2@feedants.test',
    });

    const now = Date.now();
    testComp = await Competition.create({
      title: 'Feedants Classical Dance Test',
      slug: 'classical-dance-test',
      category: 'Dance',
      tags: ['Dance', 'Multi-Win'],
      perks: ['Winners get certificate'],
      prizePool: 1500,
      entryFee: 99,
      maxParticipants: 2,
      bookedSpots: 0,
      status: 'ACTIVE',
      judge: {
        name: 'Manju Dubey',
        title: 'Professional Kathak Dancer',
        experience: '12+ Years of Experience',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        introVideoUrl: 'https://video.example.com/intro.mp4',
      },
      importantDates: {
        registrationStartsAt: new Date(now - 3600000), // 1 hour ago
        registrationClosesAt: new Date(now + 86400000), // 1 day later
        submissionStartsAt: new Date(now - 1800000), // 30 mins ago (overlapping!)
        submissionEndsAt: new Date(now + 172800000), // 2 days later
        resultDate: new Date(now + 259200000), // 3 days later
      },
      rewards: [
        { position: '1st Winner', amount: 550, iconType: 'gold' },
        { position: '2nd Winner', amount: 300, iconType: 'silver' },
      ],
      rulesAndEligibility: ['Open to all age groups', 'Continuous single-take recording'],
    });
  });

  // 1. GET Competition & Permissions
  describe('GET /api/v1/competitions/:id', () => {
    it('should return competition details with decoupled permissions and contextual countdown', async () => {
      const res = await request(app).get(`/api/v1/competitions/${testComp._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.computed).toHaveProperty('canRegister', true);
      expect(res.body.data.computed).toHaveProperty('canSubmit', true);
      expect(res.body.data.computed.spotsLeft).toBe(2);
      expect(res.body.data.computed.countdownConfig.type).toBe('REGISTRATION_CLOSES');
      expect(res.body.data.competition.perks).toContain('Winners get certificate');
    });

    it('should accurately reflect user participation state for confirmed users', async () => {
      // Before registration
      const res1 = await request(app)
        .get(`/api/v1/competitions/${testComp._id}`)
        .set('x-user-id', testUser1._id.toString());
      expect(res1.body.data.userParticipation.isRegistered).toBe(false);

      // Register testUser1
      await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      // After registration
      const res2 = await request(app)
        .get(`/api/v1/competitions/${testComp._id}`)
        .set('x-user-id', testUser1._id.toString());
      expect(res2.body.data.userParticipation.isRegistered).toBe(true);
      expect(res2.body.data.computed.spotsLeft).toBe(1);
    });
  });

  // 2. Concurrency & Capacity Race Protection
  describe('Concurrency & Capacity Protection', () => {
    it('should prevent overbooking when multiple concurrent users race for remaining spots', async () => {
      const candidateUsers = [];
      for (let i = 1; i <= 6; i++) {
        candidateUsers.push(
          await User.create({
            name: `Candidate ${i}`,
            email: `candidate_${Date.now()}_${i}@test.com`,
          })
        );
      }

      // Fire 6 simultaneous registration requests
      const responses = await Promise.all(
        candidateUsers.map((user) =>
          request(app)
            .post(`/api/v1/competitions/${testComp._id}/register`)
            .set('x-user-id', user._id.toString())
            .send({ paymentMethod: 'demo_razorpay' })
        )
      );

      const successResponses = responses.filter((r) => r.status === 201);
      const fullResponses = responses.filter((r) => r.status === 409 && r.body.error?.code === 'COMPETITION_FULL');

      // Exactly 2 must succeed, exactly 4 must receive COMPETITION_FULL
      expect(successResponses.length).toBe(2);
      expect(fullResponses.length).toBe(4);

      // Verify physical MongoDB consistency
      const updatedComp = await Competition.findById(testComp._id);
      expect(updatedComp.bookedSpots).toBe(2);

      const dbRegistrationsCount = await Registration.countDocuments({
        competitionId: testComp._id,
        status: 'CONFIRMED',
      });
      expect(dbRegistrationsCount).toBe(2);
    });

    it('should reject concurrent duplicate registration requests by the same user', async () => {
      // Fire 4 simultaneous requests from testUser1
      const responses = await Promise.all([
        request(app).post(`/api/v1/competitions/${testComp._id}/register`).set('x-user-id', testUser1._id.toString()),
        request(app).post(`/api/v1/competitions/${testComp._id}/register`).set('x-user-id', testUser1._id.toString()),
        request(app).post(`/api/v1/competitions/${testComp._id}/register`).set('x-user-id', testUser1._id.toString()),
        request(app).post(`/api/v1/competitions/${testComp._id}/register`).set('x-user-id', testUser1._id.toString()),
      ]);

      const successCount = responses.filter((r) => r.status === 201).length;
      const alreadyRegCount = responses.filter(
        (r) => r.status === 409 && r.body.error?.code === 'ALREADY_REGISTERED'
      ).length;

      expect(successCount).toBe(1);
      expect(alreadyRegCount).toBe(3);

      const updatedComp = await Competition.findById(testComp._id);
      expect(updatedComp.bookedSpots).toBe(1);
    });
  });

  // 3. Scoped Idempotency Replay
  describe('Idempotency Scoping and Replay', () => {
    it('should return identical logical operation result on idempotency retry without re-incrementing capacity', async () => {
      const idempotencyKey = 'key_unique_session_123';

      // 1st Attempt
      const res1 = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString())
        .set('idempotency-key', idempotencyKey)
        .send({ paymentMethod: 'demo_razorpay' });

      expect(res1.status).toBe(201);
      expect(res1.body.success).toBe(true);
      const regId = res1.body.data.registration._id;

      // 2nd Attempt (Retry with same idempotency key)
      const res2 = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString())
        .set('idempotency-key', idempotencyKey)
        .send({ paymentMethod: 'demo_razorpay' });

      expect(res2.status).toBe(201);
      expect(res2.body.success).toBe(true);
      expect(res2.body.data.registration._id).toBe(regId);
      expect(res2.body.data.idempotentReplay).toBe(true);
      expect(res2.body.data).toHaveProperty('competition');
      expect(res2.body.data).toHaveProperty('computed');

      // Booked spots must remain 1 (not 2)
      const updatedComp = await Competition.findById(testComp._id);
      expect(updatedComp.bookedSpots).toBe(1);
    });
  });

  // 4. Cancelled Registrations & Submission Permissions
  describe('Cancelled Registration Handling', () => {
    it('should reject submissions if user registration is CANCELLED (HTTP 403)', async () => {
      // Create a cancelled registration
      await Registration.create({
        competitionId: testComp._id,
        userId: testUser1._id,
        amountPaid: 99,
        status: 'CANCELLED',
      });

      // Attempt submission
      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/submissions`)
        .set('x-user-id', testUser1._id.toString())
        .send({
          title: 'Kathak Tarana',
          videoUrl: 'https://video.example.com/dance.mp4',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('REGISTRATION_REQUIRED');
    });

    it('should allow user with cancelled registration to register again and reactivate', async () => {
      // User registered previously, then was cancelled
      await Registration.create({
        competitionId: testComp._id,
        userId: testUser1._id,
        amountPaid: 99,
        status: 'CANCELLED',
      });

      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString())
        .send({ paymentMethod: 'demo_razorpay' });

      expect(res.status).toBe(201);
      expect(res.body.data.registration.status).toBe('CONFIRMED');

      const updatedComp = await Competition.findById(testComp._id);
      expect(updatedComp.bookedSpots).toBe(1);
    });
  });

  // 5. Duplicate Submission Race
  describe('Duplicate Submission Race Condition', () => {
    it('should return 409 ALREADY_SUBMITTED during concurrent submission race', async () => {
      // First confirm registration
      await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      // Fire 4 simultaneous submission calls
      const responses = await Promise.all([
        request(app).post(`/api/v1/competitions/${testComp._id}/submissions`).set('x-user-id', testUser1._id.toString()).send({ title: 'Performance', videoUrl: 'https://v.com/1.mp4' }),
        request(app).post(`/api/v1/competitions/${testComp._id}/submissions`).set('x-user-id', testUser1._id.toString()).send({ title: 'Performance', videoUrl: 'https://v.com/2.mp4' }),
        request(app).post(`/api/v1/competitions/${testComp._id}/submissions`).set('x-user-id', testUser1._id.toString()).send({ title: 'Performance', videoUrl: 'https://v.com/3.mp4' }),
        request(app).post(`/api/v1/competitions/${testComp._id}/submissions`).set('x-user-id', testUser1._id.toString()).send({ title: 'Performance', videoUrl: 'https://v.com/4.mp4' }),
      ]);

      const successSubmissions = responses.filter((r) => r.status === 201);
      const conflictSubmissions = responses.filter((r) => r.status === 409 && r.body.error?.code === 'ALREADY_SUBMITTED');

      expect(successSubmissions.length).toBe(1);
      expect(conflictSubmissions.length).toBe(3);

      const dbCount = await Submission.countDocuments({ competitionId: testComp._id, userId: testUser1._id });
      expect(dbCount).toBe(1);
    });
  });

  // 6. Overlapping Windows, Lifecycle States & Status Restrictions
  describe('Lifecycle State Rules', () => {
    it('should allow both registration and submission during overlapping window', async () => {
      const res = await request(app).get(`/api/v1/competitions/${testComp._id}`);
      expect(res.body.data.computed.canRegister).toBe(true);
      expect(res.body.data.computed.canSubmit).toBe(true);
      expect(res.body.data.computed.competitionPhase).toBe('REGISTRATION_AND_SUBMISSION_OPEN');
    });

    it('should reject registration when competition is full (HTTP 409)', async () => {
      testComp.bookedSpots = 2; // max is 2
      await testComp.save();

      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('COMPETITION_FULL');
    });

    it('should reject registration when deadline has passed (HTTP 400)', async () => {
      testComp.importantDates.registrationClosesAt = new Date(Date.now() - 5000);
      await testComp.save();

      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('REGISTRATION_CLOSED');
    });

    it('should reject registration when competition is upcoming and not started (HTTP 400)', async () => {
      testComp.importantDates.registrationStartsAt = new Date(Date.now() + 86400000);
      await testComp.save();

      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('REGISTRATION_NOT_STARTED');
    });

    it('should reject registration and submission for DRAFT competitions (HTTP 400)', async () => {
      testComp.status = 'DRAFT';
      await testComp.save();

      const regRes = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());
      expect(regRes.status).toBe(400);
      expect(regRes.body.error.code).toBe('COMPETITION_DRAFT');

      const subRes = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/submissions`)
        .set('x-user-id', testUser1._id.toString())
        .send({ title: 'Draft test', videoUrl: 'https://v.com/1.mp4' });
      expect(subRes.status).toBe(400);
      expect(subRes.body.error.code).toBe('COMPETITION_DRAFT');
    });

    it('should reject registration and submission for CANCELLED competitions (HTTP 400)', async () => {
      testComp.status = 'CANCELLED';
      await testComp.save();

      const regRes = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());
      expect(regRes.status).toBe(400);
      expect(regRes.body.error.code).toBe('COMPETITION_CANCELLED');

      const subRes = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/submissions`)
        .set('x-user-id', testUser1._id.toString())
        .send({ title: 'Cancelled test', videoUrl: 'https://v.com/1.mp4' });
      expect(subRes.status).toBe(400);
      expect(subRes.body.error.code).toBe('COMPETITION_CANCELLED');
    });

    it('should reject registration and submission for COMPLETED competitions (HTTP 400)', async () => {
      testComp.status = 'COMPLETED';
      await testComp.save();

      const regRes = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());
      expect(regRes.status).toBe(400);
      expect(regRes.body.error.code).toBe('COMPETITION_COMPLETED');

      const subRes = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/submissions`)
        .set('x-user-id', testUser1._id.toString())
        .send({ title: 'Completed test', videoUrl: 'https://v.com/1.mp4' });
      expect(subRes.status).toBe(400);
      expect(subRes.body.error.code).toBe('COMPETITION_COMPLETED');
    });
  });
});
