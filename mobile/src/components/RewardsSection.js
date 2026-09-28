import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { formatCurrency } from '../utils/formatters';

export const RewardsSection = ({ rewards }) => {
  if (!rewards || rewards.length === 0) return null;

  const renderIcon = (iconType, index) => {
    switch (iconType) {
      case 'gold':
        return <Text style={styles.emojiIcon}>🏆</Text>;
      case 'silver':
        return <Text style={styles.emojiIcon}>🥈</Text>;
      case 'bronze':
        return <Text style={styles.emojiIcon}>🥉</Text>;
      default:
        return <Ionicons name="star-outline" size={18} color={COLORS.primary} style={styles.starIcon} />;
    }
  };

  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Rewards</Text>
        <Text style={styles.subTitle}>(All Positions)</Text>
      </View>

      {/* Rewards List */}
      <View style={styles.rewardsList}>
        {rewards.map((reward, idx) => (
          <View key={idx} style={[styles.rewardRow, idx < rewards.length - 1 && styles.rewardRowBorder]}>
            <View style={styles.leftInfo}>
              {renderIcon(reward.iconType, idx)}
              <Text style={styles.positionText}>{reward.position}</Text>
            </View>
            <Text style={styles.amountText}>{formatCurrency(reward.amount)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  subTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rewardsList: {},
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rewardRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  starIcon: {
    marginRight: 10,
  },
  positionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
