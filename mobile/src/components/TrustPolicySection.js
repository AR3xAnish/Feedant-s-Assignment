import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const TrustPolicySection = ({ onOpenPrizeMoneyVideo, onOpenRefundPolicy }) => {
  return (
    <View style={styles.container}>
      {/* Left Card: Prize Money Video */}
      <TouchableOpacity
        style={[styles.card, styles.leftCard]}
        onPress={onOpenPrizeMoneyVideo}
        activeOpacity={0.8}
      >
        <View style={styles.playCircle}>
          <Ionicons name="play" size={16} color={COLORS.playButtonIcon} style={{ marginLeft: 2 }} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.mainTitle}>How will you receive prize money?</Text>
          <Text style={styles.subTitle}>Watch video to know more</Text>
        </View>
      </TouchableOpacity>

      {/* Right Card: Policies & Razorpay */}
      <View style={[styles.card, styles.rightCard]}>
        <TouchableOpacity
          style={styles.policyRow}
          onPress={onOpenRefundPolicy}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} style={styles.shieldIcon} />
          <Text style={styles.policyText}>Refund policy</Text>
        </TouchableOpacity>

        <View style={styles.policyRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} style={styles.shieldIcon} />
          <Text style={styles.policyText}>
            Secure payments powered by <Text style={styles.razorpayBrand}>Razorpay</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  leftCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.playButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTextContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  rightCard: {
    justifyContent: 'space-around',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  shieldIcon: {
    marginRight: 6,
  },
  policyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  razorpayBrand: {
    fontWeight: '800',
    color: '#0C2340',
    fontStyle: 'italic',
  },
});
