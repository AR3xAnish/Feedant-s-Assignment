import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { useCountdown } from '../hooks/useCountdown';

export const CountdownBanner = ({ computed, targetDate, t = {} }) => {
  const config = computed?.countdownConfig || null;

  // Determine active countdown target
  const activeTargetDate = config?.targetDate || targetDate;
  const { days, hours, minutes, seconds, isExpired } = useCountdown(activeTargetDate);

  const countdownType = config?.type || 'REGISTRATION_CLOSES';
  const hurryUpLabel = t.hurryUp || 'Hurry up!';

  // Non-countdown states: Completed, Judging, Full, Closed
  if (computed?.lifecycleStatus === 'COMPLETED' || countdownType === 'COMPLETED') {
    return (
      <View style={[styles.banner, styles.completedBanner]}>
        <View style={styles.leftGroup}>
          <Ionicons name="trophy" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.completedText}>Competition Completed</Text>
        </View>
        <Text style={styles.completedSubtext}>Winners declared</Text>
      </View>
    );
  }

  if (computed?.lifecycleStatus === 'JUDGING' || countdownType === 'RESULTS_ANNOUNCED') {
    return (
      <View style={[styles.banner, styles.judgingBanner]}>
        <View style={styles.leftGroup}>
          <Ionicons name="hourglass" size={16} color="#0284C7" style={{ marginRight: 6 }} />
          <Text style={styles.judgingText}>Judging In Progress</Text>
        </View>
        <Text style={styles.judgingSubtext}>Evaluations underway</Text>
      </View>
    );
  }

  if (computed?.isFull || countdownType === 'FULL') {
    return (
      <View style={[styles.banner, styles.closedBanner]}>
        <View style={styles.leftGroup}>
          <Ionicons name="people" size={16} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.closedText}>All Spots Booked</Text>
        </View>
        <Text style={styles.closedSubtext}>Housefull</Text>
      </View>
    );
  }

  if (computed?.lifecycleStatus === 'UPCOMING' || countdownType === 'REGISTRATION_OPENS') {
    return (
      <View style={[styles.banner, styles.upcomingBanner]}>
        <View style={styles.leftGroup}>
          <Ionicons name="calendar-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
          <Text style={styles.upcomingText}>Registration opens in</Text>
        </View>
        <View style={styles.countdownGroup}>
          <Text style={[styles.countdownText, { color: '#D97706' }]}>
            {days}d : {hours}h : {minutes}m : {seconds}s
          </Text>
        </View>
        <View style={styles.rightGroup}>
          <Text style={[styles.hurryUpText, { color: '#D97706' }]}>Upcoming</Text>
        </View>
      </View>
    );
  }

  if (computed?.lifecycleStatus === 'SUBMISSION_OPEN' && !computed?.canRegister) {
    return (
      <View style={styles.banner}>
        <View style={styles.leftGroup}>
          <Ionicons name="arrow-up-circle-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.labelText}>Submissions close in</Text>
        </View>
        <View style={styles.countdownGroup}>
          <Text style={styles.countdownText}>
            {days}d : {hours}h : {minutes}m : {seconds}s
          </Text>
        </View>
        <View style={styles.rightGroup}>
          <Text style={styles.hurryUpText}>Active</Text>
        </View>
      </View>
    );
  }

  if (!computed?.canRegister || isExpired) {
    return (
      <View style={[styles.banner, styles.closedBanner]}>
        <View style={styles.leftGroup}>
          <Ionicons name="time" size={16} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.closedText}>Registration has ended</Text>
        </View>
        <Text style={styles.closedSubtext}>Closed</Text>
      </View>
    );
  }

  // Active Registration Countdown (Reference Design State)
  const registrationClosesLabel = t.registrationClosesIn || 'Registration closes in';

  return (
    <View style={styles.banner}>
      {/* Left Hourglass & Label */}
      <View style={styles.leftGroup}>
        <Ionicons name="hourglass-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
        <Text style={styles.labelText}>{registrationClosesLabel}</Text>
      </View>

      {/* Center Countdown Display */}
      <View style={styles.countdownGroup}>
        <Text style={styles.countdownText}>
          {days}d : {hours}h : {minutes}m : {seconds}s
        </Text>
      </View>

      {/* Right Hurry Up badge */}
      <View style={styles.rightGroup}>
        <Ionicons name="timer-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
        <Text style={styles.hurryUpText}>{hurryUpLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1EAEB',
  },
  closedBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  upcomingBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  judgingBanner: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  completedBanner: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  closedText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  closedSubtext: {
    fontSize: 11,
    color: '#991B1B',
  },
  upcomingText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
  },
  judgingText: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
  },
  judgingSubtext: {
    fontSize: 11,
    color: '#0284C7',
  },
  completedText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },
  completedSubtext: {
    fontSize: 11,
    color: '#059669',
  },
  countdownGroup: {
    paddingHorizontal: 4,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hurryUpText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
