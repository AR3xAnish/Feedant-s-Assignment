require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const registrationService = require('../services/registrationService');

async function runConcurrencyTest() {
  console.log('\n======================================================');
  console.log('   FEEDANTS CONCURRENCY & CAPACITY STRESS TEST        ');
  console.log('======================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedants_competition';
  await mongoose.connect(mongoUri);

  // 1. Setup a controlled test competition
  const testComp = await Competition.create({
    title: 'Concurrency Stress Test Competition',
    slug: `stress-test-${Date.now()}`,
    category: 'Dance',
    tags: ['Stress', 'Test'],
    prizePool: 1000,
    entryFee: 50,
    maxParticipants: 5,
    bookedSpots: 3, // Only 2 spots left!
    status: 'ACTIVE',
    judge: {
      name: 'Test Judge',
      title: 'Senior Evaluator',
      experience: '10 Years',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    },
    importantDates: {
      registrationStartsAt: new Date(Date.now() - 3600000),
      registrationClosesAt: new Date(Date.now() + 3600000),
      submissionStartsAt: new Date(Date.now() - 1800000),
      submissionEndsAt: new Date(Date.now() + 7200000),
      resultDate: new Date(Date.now() + 10800000),
    },
    rewards: [{ position: '1st', amount: 1000, iconType: 'gold' }],
  });

  console.log(`[Test Setup] Created competition "${testComp.title}"`);
  console.log(`[Test Setup] Max Capacity: ${testComp.maxParticipants}, Already Booked: ${testComp.bookedSpots}`);
  console.log(`[Test Setup] Available spots: ${testComp.maxParticipants - testComp.bookedSpots}`);

  // 2. Create 10 unique users attempting to register simultaneously for the 2 remaining spots
  const users = [];
  for (let i = 1; i <= 10; i++) {
    users.push(
      await User.create({
        name: `Concurrent User ${i}`,
        email: `concurrent_${Date.now()}_${i}@test.com`,
      })
    );
  }

  console.log(`[Test Setup] Created ${users.length} distinct users.`);
  console.log(`\n>>> Launching ${users.length} simultaneous registration requests targeting 2 spots...`);

  const results = await Promise.allSettled(
    users.map((user) =>
      registrationService.registerUser({
        competitionId: testComp._id,
        userId: user._id,
        paymentMethod: 'demo_razorpay',
      })
    )
  );

  let successCount = 0;
  let fullCount = 0;
  let otherErrorCount = 0;

  results.forEach((res, idx) => {
    if (res.status === 'fulfilled') {
      successCount++;
      console.log(`  ✓ Request ${idx + 1} (${users[idx].name}): SUCCESS`);
    } else {
      const err = res.reason;
      if (err.code === 'COMPETITION_FULL') {
        fullCount++;
        console.log(`  ✗ Request ${idx + 1} (${users[idx].name}): REJECTED (COMPETITION_FULL - HTTP 409)`);
      } else {
        otherErrorCount++;
        console.log(`  ✗ Request ${idx + 1} (${users[idx].name}): ERROR (${err.message})`);
      }
    }
  });

  // Verify DB state
  const finalComp = await Competition.findById(testComp._id);
  const totalRegistrationsInDB = await Registration.countDocuments({ competitionId: testComp._id });

  console.log('\n----------------- VERIFICATION RESULTS -----------------');
  console.log(`Successful Registrations: ${successCount} (Expected: 2)`);
  console.log(`Rejected (Full) Requests: ${fullCount} (Expected: 8)`);
  console.log(`Other Errors:             ${otherErrorCount}`);
  console.log(`Final bookedSpots in DB:  ${finalComp.bookedSpots} (Max: ${finalComp.maxParticipants})`);
  console.log(`Total DB Registrations:   ${totalRegistrationsInDB}`);

  const capacitySafe = finalComp.bookedSpots === testComp.maxParticipants && successCount === 2;
  const noOverbooking = finalComp.bookedSpots <= testComp.maxParticipants;

  if (capacitySafe && noOverbooking) {
    console.log('\n>>> PASS: Atomic capacity checks successfully prevented race conditions & overbooking! <<<\n');
  } else {
    console.error('\n>>> FAIL: Concurrency violation detected! <<<\n');
  }

  // Cleanup test data
  await Competition.findByIdAndDelete(testComp._id);
  await Registration.deleteMany({ competitionId: testComp._id });
  await User.deleteMany({ _id: { $in: users.map((u) => u._id) } });

  await mongoose.disconnect();
}

if (require.main === module) {
  runConcurrencyTest().catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  });
}

module.exports = runConcurrencyTest;
