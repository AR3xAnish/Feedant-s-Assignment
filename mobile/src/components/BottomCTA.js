import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../styles/colors';
import { formatCurrency } from '../utils/formatters';

export const BottomCTA = ({
  competition,
  computed,
  userParticipation,
  loadingAction,
  onRegisterPress,
  onSubmitPress,
  t = {},
}) => {
  if (!competition) return null;

  const isRegistered = userParticipation?.isRegistered;
  const hasSubmitted = userParticipation?.hasSubmitted;
  const canSubmit = computed?.canSubmit;
  const canRegister = computed?.canRegister;
  const isFull = computed?.isFull;
  const spotsLeft = computed?.spotsLeft ?? Math.max(0, competition.maxParticipants - competition.bookedSpots);
  const judgeName = competition.judge?.name || 'Judge';

  let buttonTitle = '';
  let buttonSubtext = '';
  let onPressHandler = () => {};
  let isDisabled = false;

  if (isRegistered) {
    if (hasSubmitted) {
      buttonTitle = t.entrySubmitted || 'Entry Submitted ✓';
      buttonSubtext = t.underReviewBy ? t.underReviewBy(judgeName) : `Under review by ${judgeName}`;
      isDisabled = true;
    } else if (canSubmit) {
      buttonTitle = t.uploadSubmission || 'Upload Submission';
      buttonSubtext = t.registered || 'Registered';
      onPressHandler = onSubmitPress;
    } else {
      buttonTitle = 'Submission Opens Soon';
      buttonSubtext = t.registered || 'Registered';
      isDisabled = true;
    }
  } else {
    // Unregistered path
    if (isFull) {
      buttonTitle = t.housefull || 'Housefull';
      buttonSubtext = 'All spots booked';
      isDisabled = true;
    } else if (!canRegister) {
      buttonTitle = t.registrationClosed || 'Registration Closed';
      buttonSubtext = 'Participation period ended';
      isDisabled = true;
    } else {
      const feeFormatted = formatCurrency(competition.entryFee);
      buttonTitle = t.registerNow ? t.registerNow(feeFormatted) : `Register Now • ${feeFormatted}`;
      buttonSubtext = spotsLeft === 1 ? 'Only 1 spot left!' : `Only ${spotsLeft} spots left`;
      onPressHandler = onRegisterPress;
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={onPressHandler}
        disabled={isDisabled || loadingAction}
        activeOpacity={0.85}
      >
        {loadingAction ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>{buttonTitle}</Text>
            {buttonSubtext ? <Text style={styles.subText}>{buttonSubtext}</Text> : null}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  textContainer: {
    alignItems: 'center',
  },
  titleText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  subText: {
    color: '#D1EAEB',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
