require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedants_competition';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await Competition.deleteMany({});
    await Registration.deleteMany({});
    await Submission.deleteMany({});
    console.log('[Seed] Cleared existing records.');

    // 1. Create Demo Users
    const users = await User.create([
      {
        name: 'Aakash Sharma',
        email: 'aakash@feedants.demo',
        phone: '+91 98765 11111',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        referralCode: 'AAKASH10',
      },
      {
        name: 'Priya Patel',
        email: 'priya@feedants.demo',
        phone: '+91 98765 22222',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        referralCode: 'PRIYA20',
      },
      {
        name: 'Rohan Verma',
        email: 'rohan@feedants.demo',
        phone: '+91 98765 33333',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
        referralCode: 'ROHAN30',
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya@feedants.demo',
        phone: '+91 98765 44444',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
        referralCode: 'ANANYA40',
      },
    ]);
    console.log(`[Seed] Created ${users.length} demo users.`);

    const registeredUser = users[0]; // Aakash

    // 2. Compute dynamic dates relative to current time
    const now = new Date();
    // Reference screen countdown: "01d : 06h : 28m : 32s" = (1 * 86400 + 6 * 3600 + 28 * 60 + 32) = 109712 seconds
    const registrationClosingTime = new Date(now.getTime() + (1 * 86400 + 6 * 3600 + 28 * 60 + 32) * 1000);
    const submissionStartTime = new Date(now.getTime() - 2 * 86400 * 1000); // 2 days ago
    const submissionEndTime = new Date(now.getTime() + 20 * 86400 * 1000); // 20 days later
    const resultDate = new Date(now.getTime() + 22 * 86400 * 1000); // 22 days later

    // 3. Create Featured Competition: "Feedants Classical Dance"
    const classicalDanceComp = await Competition.create({
      title: 'Feedants Classical Dance',
      slug: 'feedants-classical-dance',
      category: 'Dance',
      tags: ['Dance', 'Multi-Win'],
      perks: ['Winners get certificate'],
      prizePool: 1500,
      entryFee: 99,
      currency: 'INR',
      maxParticipants: 20,
      bookedSpots: 1, // 1/20 booked, leaving 19 spots left!
      status: 'ACTIVE',
      judge: {
        name: 'Manju Dubey',
        title: 'Professional Kathak Dancer',
        experience: '12+ Years of Experience',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
      importantDates: {
        registrationStartsAt: new Date(now.getTime() - 7 * 86400 * 1000),
        registrationClosesAt: registrationClosingTime,
        submissionStartsAt: submissionStartTime,
        submissionEndsAt: submissionEndTime,
        resultDate: resultDate,
      },
      previousWinners: [
        {
          name: 'Riya Shah',
          rank: '1st Winner',
          videoThumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          name: 'Aarav Mehta',
          rank: '1st Winner',
          videoThumbnail: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=400&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          name: 'Neha Verma',
          rank: '2nd Winner',
          videoThumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          name: 'Ishita Ch...',
          rank: '3rd Winner',
          videoThumbnail: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        },
      ],
      about:
        'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
      judgingCriteria: [
        'Rhythm, Footwork & Timing (Taal, Laya & Padanyas)',
        'Facial Expressions & Storytelling (Abhinaya, Bhava & Rasa)',
        'Costume, Grace & Traditional Posture (Angashuddhi)',
        'Technique authenticity & Artistic Execution',
      ],
      rulesAndEligibility: [
        'Open to all age groups and skill levels across India & internationally.',
        'Video submission length must be strictly between 2 to 5 minutes.',
        'Continuous single-take recording without cuts or video effects.',
        'Traditional classical attire recommended.',
        'Only contributions from paid participants will be considered for judging.',
      ],
      rewards: [
        { position: '1st Winner', amount: 550, iconType: 'gold' },
        { position: '2nd Winner', amount: 300, iconType: 'silver' },
        { position: '3rd Winner', amount: 240, iconType: 'bronze' },
        { position: '4th Winner', amount: 200, iconType: 'star' },
        { position: '5th Winner', amount: 130, iconType: 'star' },
        { position: '6th Winner', amount: 80, iconType: 'star' },
      ],
      disclaimer: 'Only contributions from paid participants will be considered for judging.',
      paymentGateway: 'Razorpay',
      reviews: [
        {
          userName: 'Sunita Rao',
          comment: 'Outstanding platform for budding classical artists! The judge feedback was deeply encouraging.',
          rating: 5,
        },
        {
          userName: 'Kunal Deshmukh',
          comment: 'Seamless registration with Razorpay and timely digital certificates. Highly recommended!',
          rating: 5,
        },
      ],
    });
    console.log(`[Seed] Created Featured Competition ID: ${classicalDanceComp._id}`);

    // 4. Create Registration for User 1 (Aakash) so he is in "Registered" state matching page 3
    const reg1 = await Registration.create({
      competitionId: classicalDanceComp._id,
      userId: registeredUser._id,
      status: 'CONFIRMED',
      amountPaid: 99,
      paymentId: 'pay_razorpay_demo_classical_1',
    });
    console.log(`[Seed] Created Registration for ${registeredUser.name} (ID: ${reg1._id})`);

    // 5. Create additional competitions for demonstrating alternate lifecycle states
    // A. SOLD OUT Competition
    await Competition.create({
      title: 'Feedants Hip-Hop Showdown',
      slug: 'feedants-hip-hop-showdown',
      category: 'Street Dance',
      tags: ['Dance', 'Solo Battle'],
      perks: ['Winners get certificate', 'Cash Prize'],
      prizePool: 3000,
      entryFee: 149,
      maxParticipants: 10,
      bookedSpots: 10, // FULL
      status: 'ACTIVE',
      judge: {
        name: 'Kabir Bboy',
        title: 'International Freestyle Champion',
        experience: '8+ Years of Experience',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      },
      importantDates: {
        registrationStartsAt: new Date(now.getTime() - 10 * 86400 * 1000),
        registrationClosesAt: new Date(now.getTime() + 2 * 86400 * 1000),
        submissionStartsAt: new Date(now.getTime() - 1 * 86400 * 1000),
        submissionEndsAt: new Date(now.getTime() + 15 * 86400 * 1000),
        resultDate: new Date(now.getTime() + 18 * 86400 * 1000),
      },
      previousWinners: [],
      rewards: [
        { position: '1st Winner', amount: 1800, iconType: 'gold' },
        { position: '2nd Winner', amount: 800, iconType: 'silver' },
        { position: '3rd Winner', amount: 400, iconType: 'bronze' },
      ],
    });

    // B. UPCOMING Competition
    await Competition.create({
      title: 'Feedants Folk Dance Fiesta',
      slug: 'feedants-folk-dance-fiesta',
      category: 'Folk Dance',
      tags: ['Folk', 'Group'],
      perks: ['Winners get certificate'],
      prizePool: 5000,
      entryFee: 199,
      maxParticipants: 30,
      bookedSpots: 0,
      status: 'UPCOMING',
      judge: {
        name: 'Geeta Joshi',
        title: 'Folk Heritage Performer',
        experience: '15+ Years of Experience',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      },
      importantDates: {
        registrationStartsAt: new Date(now.getTime() + 3 * 86400 * 1000), // starts in 3 days
        registrationClosesAt: new Date(now.getTime() + 12 * 86400 * 1000),
        submissionStartsAt: new Date(now.getTime() + 5 * 86400 * 1000),
        submissionEndsAt: new Date(now.getTime() + 20 * 86400 * 1000),
        resultDate: new Date(now.getTime() + 25 * 86400 * 1000),
      },
      previousWinners: [],
      rewards: [
        { position: '1st Winner', amount: 3000, iconType: 'gold' },
        { position: '2nd Winner', amount: 1500, iconType: 'silver' },
        { position: '3rd Winner', amount: 500, iconType: 'bronze' },
      ],
    });

    console.log('[Seed] Database seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
