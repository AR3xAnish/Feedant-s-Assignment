const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Competition = require('../src/models/Competition');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');
const Submission = require('../src/models/Submission');

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedants_competition_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Competition & Registration Business Rules API', () => {
  let testUser1;
  let testUser2;
  let testComp;

  beforeEach(async () => {
    await User.deleteMany({});
    await Competition.deleteMany({});
    await Registration.deleteMany({});
    await Submission.deleteMany({});

    testUser1 = await User.create({
      name: 'Test Participant 1',
      email: 'p1@feedants.test',
    });

    testUser2 = await User.create({
      name: 'Test Participant 2',
      email: 'p2@feedants.test',
    });

    testComp = await Competition.create({
      title: 'Feedants Classical Dance Test',
      category: 'Dance',
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
      },
      importantDates: {
        registrationStartsAt: new Date(Date.now() - 3600000),
        registrationClosesAt: new Date(Date.now() + 86400000), // closes tomorrow
        submissionStartsAt: new Date(Date.now() - 1800000), // open now
        submissionEndsAt: new Date(Date.now() + 172800000),
        resultDate: new Date(Date.now() + 259200000),
      },
      rewards: [
        { position: '1st Winner', amount: 550, iconType: 'gold' },
        { position: '2nd Winner', amount: 300, iconType: 'silver' },
      ],
    });
  });

  describe('GET /api/v1/competitions/:id', () => {
    it('should return competition details with computed dynamic fields', async () => {
      const res = await request(app).get(`/api/v1/competitions/${testComp._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.competition.title).toBe('Feedants Classical Dance Test');
      expect(res.body.data.computed.lifecycleStatus).toBe('REGISTRATION_OPEN');
      expect(res.body.data.computed.spotsLeft).toBe(2);
      expect(res.body.data.computed.registrationCountdown).toHaveProperty('days');
      expect(res.body.data.computed.registrationCountdown).toHaveProperty('formatted');
    });

    it('should correctly reflect user participation state when x-user-id header is provided', async () => {
      // Prior to registration
      const res1 = await request(app)
        .get(`/api/v1/competitions/${testComp._id}`)
        .set('x-user-id', testUser1._id.toString());
      expect(res1.body.data.userParticipation.isRegistered).toBe(false);

      // Register testUser1
      await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      // Subsequent check
      const res2 = await request(app)
        .get(`/api/v1/competitions/${testComp._id}`)
        .set('x-user-id', testUser1._id.toString());
      expect(res2.body.data.userParticipation.isRegistered).toBe(true);
      expect(res2.body.data.computed.spotsLeft).toBe(1);
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app).get('/api/v1/competitions/not-a-valid-id');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_ID');
    });

    it('should return 404 for non-existent competition', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/competitions/${randomId}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('COMPETITION_NOT_FOUND');
    });
  });

  describe('POST /api/v1/competitions/:id/register', () => {
    it('should successfully register an eligible user and decrement available capacity', async () => {
      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString())
        .send({ paymentMethod: 'demo_razorpay' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registration.status).toBe('CONFIRMED');

      const updated = await Competition.findById(testComp._id);
      expect(updated.bookedSpots).toBe(1);
    });

    it('should prevent duplicate registration by the same user (HTTP 409)', async () => {
      // First registration
      await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      // Second registration attempt
      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ALREADY_REGISTERED');
    });

    it('should reject registration when competition is full (HTTP 409)', async () => {
      // Fill all 2 spots
      await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());
      await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser2._id.toString());

      // Third user tries to register
      const testUser3 = await User.create({ name: 'User 3', email: 'u3@test.com' });
      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser3._id.toString());

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('COMPETITION_FULL');
    });

    it('should reject registration when registration window has passed (HTTP 400)', async () => {
      // Move registrationClosesAt to past
      testComp.importantDates.registrationClosesAt = new Date(Date.now() - 1000);
      await testComp.save();

      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('REGISTRATION_CLOSED');
    });
  });

  describe('POST /api/v1/competitions/:id/submissions', () => {
    it('should reject submission if user is not registered (HTTP 403)', async () => {
      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/submissions`)
        .set('x-user-id', testUser1._id.toString())
        .send({
          title: 'My Dance Video',
          videoUrl: 'https://video.example.com/dance.mp4',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('REGISTRATION_REQUIRED');
    });

    it('should allow submission if user is registered and submission window is open', async () => {
      // First register
      await request(app)
        .post(`/api/v1/competitions/${testComp._id}/register`)
        .set('x-user-id', testUser1._id.toString());

      // Then submit
      const res = await request(app)
        .post(`/api/v1/competitions/${testComp._id}/submissions`)
        .set('x-user-id', testUser1._id.toString())
        .send({
          title: 'Kathak Tarana Performance',
          videoUrl: 'https://video.example.com/kathak.mp4',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SUBMITTED');
    });
  });
});
