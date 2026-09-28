import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { useCountdown } from '../hooks/useCountdown';

export const CountdownBanner = ({ targetDate, isRegistrationClosed }) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isRegistrationClosed || isExpired) {
    return (
      <View style={[styles.banner, styles.closedBanner]}>
        <View style={styles.leftGroup}>
          <Ionicons name="time" size={16} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.closedText}>Registration has ended</Text>
        </View>
        <Text style={styles.closedSubtext}>Submissions in progress</Text>
      </View>
    );
  }

  return (
    <View style={styles.banner}>
      {/* Left Hourglass & Label */}
      <View style={styles.leftGroup}>
        <Ionicons name="hourglass-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
        <Text style={styles.labelText}>Registration closes in</Text>
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
        <Text style={styles.hurryUpText}>Hurry up!</Text>
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
