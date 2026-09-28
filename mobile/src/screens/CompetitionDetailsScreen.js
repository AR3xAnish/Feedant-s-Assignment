import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import competitionApi from '../api/competitionApi';

// Subcomponents
import { HeaderBar } from '../components/HeaderBar';
import { SummaryCard } from '../components/SummaryCard';
import { JudgeCard } from '../components/JudgeCard';
import { CountdownBanner } from '../components/CountdownBanner';
import { ImportantDatesGrid } from '../components/ImportantDatesGrid';
import { PreviousWinnersCarousel } from '../components/PreviousWinnersCarousel';
import { CompetitionTabsSection } from '../components/CompetitionTabsSection';
import { RewardsSection } from '../components/RewardsSection';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { TrustPolicySection } from '../components/TrustPolicySection';
import { ReferralBanner } from '../components/ReferralBanner';
import { UserReviewsCard } from '../components/UserReviewsCard';
import { AdBanner } from '../components/AdBanner';
import { BottomCTA } from '../components/BottomCTA';
import { BottomNav } from '../components/BottomNav';
import { RegistrationModal, SubmissionModal, VideoModal } from '../components/Modals';

export const CompetitionDetailsScreen = () => {
  // Server state
  const [competition, setCompetition] = useState(null);
  const [computed, setComputed] = useState(null);
  const [userParticipation, setUserParticipation] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [competitionsList, setCompetitionsList] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('ENG');

  // Modal states
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [videoModalData, setVideoModalData] = useState({ title: '', url: '' });

  // Initial Data Load
  const initApp = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch demo users
      const usersData = await competitionApi.getUsers();
      setUsers(usersData);
      
      // Default to User 1 (Aakash Sharma - already registered to match page 3)
      const defaultUser = usersData[0] || null;
      setCurrentUser(defaultUser);

      // 2. Fetch competitions list
      const comps = await competitionApi.getCompetitions();
      setCompetitionsList(comps);

      // 3. Select Featured Competition ("Feedants Classical Dance")
      const featured =
        comps.find((c) => c.competition.slug === 'feedants-classical-dance' || c.competition.title.includes('Classical'))?.competition ||
        comps[0]?.competition ||
        null;
      if (featured) {
        await loadCompetition(featured._id, defaultUser?._id);
      }
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const loadCompetition = async (compId, userId) => {
    try {
      const data = await competitionApi.getCompetitionById(compId, userId);
      setCompetition(data.competition);
      setComputed(data.computed);
      setUserParticipation(data.userParticipation);
    } catch (err) {
      console.error('Failed to load competition:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  // Handle switching user
  const handleSelectUser = async (user) => {
    setCurrentUser(user);
    if (competition?._id) {
      await loadCompetition(competition._id, user._id);
    }
  };

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (competition?._id) {
      await loadCompetition(competition._id, currentUser?._id);
    }
    setRefreshing(false);
  }, [competition?._id, currentUser?._id]);

  // Handle Registration
  const handleConfirmRegistration = async () => {
    if (!competition?._id || !currentUser?._id) return;
    try {
      setIsRegistering(true);
      setRegistrationError(null);

      const idempotencyKey = `idemp_${currentUser._id}_${competition._id}_${Date.now()}`;
      const res = await competitionApi.register(competition._id, currentUser._id, idempotencyKey);

      // Instantly update screen with authoritative data returned from backend
      setCompetition(res.data.competition);
      setComputed(res.data.computed);
      setUserParticipation({
        isRegistered: true,
        registrationId: res.data.registration._id,
        registeredAt: res.data.registration.registeredAt,
        hasSubmitted: false,
      });

      setRegistrationModalVisible(false);
      Alert.alert('Registration Successful', 'You have secured your spot for this competition!');
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Submission
  const handleConfirmSubmission = async ({ title, videoUrl, description }) => {
    if (!competition?._id || !currentUser?._id) return;
    try {
      setIsSubmitting(true);
      setSubmissionError(null);

      const res = await competitionApi.submitEntry(competition._id, currentUser._id, {
        title,
        videoUrl,
        description,
      });

      setUserParticipation((prev) => ({
        ...prev,
        hasSubmitted: true,
        submission: res.data,
      }));

      setSubmissionModalVisible(false);
      Alert.alert('Submission Successful', 'Your entry has been submitted for evaluation!');
    } catch (err) {
      setSubmissionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Video Handlers
  const handlePlayJudgeIntro = (judge) => {
    setVideoModalData({
      title: `${judge.name} - Judge Intro Video`,
      url: judge.introVideoUrl,
    });
    setVideoModalVisible(true);
  };

  const handleSelectWinner = (winner) => {
    setVideoModalData({
      title: `${winner.name} - ${winner.rank} Performance Reel`,
      url: winner.videoUrl,
    });
    setVideoModalVisible(true);
  };

  const handleOpenPrizeMoneyVideo = () => {
    setVideoModalData({
      title: 'Prize Money Disbursement Policy Video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    });
    setVideoModalVisible(true);
  };

  // Loading Screen
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading competition details...</Text>
      </SafeAreaView>
    );
  }

  // Error Screen
  if (error || !competition) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Failed to load competition</Text>
        <Text style={styles.errorMessage}>{error || 'Competition not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initApp}>
          <Text style={styles.retryText}>Retry Connection</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header Bar with Back Button, Language Toggle & Demo User Switcher */}
      <HeaderBar
        currentLanguage={currentLanguage}
        onToggleLanguage={setCurrentLanguage}
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* 2. Main Competition Summary Card */}
        <SummaryCard
          competition={competition}
          computed={computed}
          userParticipation={userParticipation}
        />

        {/* 3. Judge Profile Card */}
        <JudgeCard judge={competition.judge} onPlayIntroVideo={handlePlayJudgeIntro} />

        {/* 4. Dynamic Countdown Banner */}
        <CountdownBanner
          targetDate={competition.importantDates?.registrationClosesAt}
          isRegistrationClosed={computed?.lifecycleStatus === 'REGISTRATION_CLOSED' || computed?.isFull}
        />

        {/* 5. Important Dates 2x2 Grid */}
        <ImportantDatesGrid importantDates={competition.importantDates} />

        {/* 6. Previous Winners Section */}
        <PreviousWinnersCarousel
          winners={competition.previousWinners}
          onSelectWinner={handleSelectWinner}
        />

        {/* 7. Tabbed Information (About, Judging Criteria, Rules) */}
        <CompetitionTabsSection competition={competition} />

        {/* 8. Rewards Breakdown Table */}
        <RewardsSection rewards={competition.rewards} />

        {/* 9. Disclaimer Banner */}
        <DisclaimerBanner disclaimer={competition.disclaimer} />

        {/* 10. Trust & Razorpay Payment Policy */}
        <TrustPolicySection
          onOpenPrizeMoneyVideo={handleOpenPrizeMoneyVideo}
          onOpenRefundPolicy={() =>
            Alert.alert(
              'Refund Policy',
              'Registrations are 100% refundable up to 24 hours before registration close date.'
            )
          }
        />

        {/* 11. Refer & Earn Banner */}
        <ReferralBanner
          referralCode={currentUser?.referralCode || 'referral123'}
          onReferNow={() =>
            Alert.alert('Referral Link', 'Referral link ready to share with your friends!')
          }
        />

        {/* 12. Hear From Our Users Reviews */}
        <UserReviewsCard reviews={competition.reviews} />

        {/* 13. Ad Placeholder */}
        <AdBanner />
      </ScrollView>

      {/* 14. Fixed Sticky Action CTA Bar */}
      <BottomCTA
        competition={competition}
        computed={computed}
        userParticipation={userParticipation}
        loadingAction={isRegistering}
        onRegisterPress={() => {
          setRegistrationError(null);
          setRegistrationModalVisible(true);
        }}
        onSubmitPress={() => {
          setSubmissionError(null);
          setSubmissionModalVisible(true);
        }}
      />

      {/* 15. Standard Bottom Navigation Bar */}
      <BottomNav userAvatar={currentUser?.avatarUrl} />

      {/* Interactive Modals */}
      <RegistrationModal
        visible={registrationModalVisible}
        onClose={() => setRegistrationModalVisible(false)}
        competition={competition}
        onConfirmRegistration={handleConfirmRegistration}
        isProcessing={isRegistering}
        error={registrationError}
      />

      <SubmissionModal
        visible={submissionModalVisible}
        onClose={() => setSubmissionModalVisible(false)}
        onSubmitEntry={handleConfirmSubmission}
        isProcessing={isSubmitting}
        error={submissionError}
      />

      <VideoModal
        visible={videoModalVisible}
        onClose={() => setVideoModalVisible(false)}
        title={videoModalData.title}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.screenBg,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
