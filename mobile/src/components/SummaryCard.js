import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { formatCurrency } from '../utils/formatters';

export const SummaryCard = ({ competition, computed, userParticipation, t = {} }) => {
  if (!competition) return null;

  const isRegistered = userParticipation?.isRegistered;
  const spotsLeft = computed?.spotsLeft ?? Math.max(0, competition.maxParticipants - competition.bookedSpots);
  const bookedSpots = competition.bookedSpots || 0;
  const maxSpots = competition.maxParticipants || 20;
  const progressRatio = Math.min(1, bookedSpots / maxSpots);

  const registeredLabel = t.registered || 'Registered';
  const openLabel = t.open || 'Open';
  const fullLabel = t.full || 'Full';
  const prizePoolLabel = t.prizePool || 'Prize Pool';
  const entryFeeLabel = t.entryFee || 'Entry Fee';
  const spotsText = t.onlySpotsLeft ? t.onlySpotsLeft(spotsLeft) : (spotsLeft === 0 ? 'No spots left' : `Only ${spotsLeft} spots left`);
  const bookedText = t.spotsBooked ? t.spotsBooked(bookedSpots, maxSpots) : `${bookedSpots} / ${maxSpots} Booked`;

  return (
    <View style={styles.card}>
      {/* Top Header Row: Title & Registration Status Badge */}
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={2}>
          {competition.title}
        </Text>

        {isRegistered ? (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.registeredBadgeText}>{registeredLabel}</Text>
          </View>
        ) : computed?.isFull ? (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>{fullLabel}</Text>
          </View>
        ) : (
          <View style={styles.openBadge}>
            <Text style={styles.openBadgeText}>{openLabel}</Text>
          </View>
        )}
      </View>

      {/* Tags & Dynamic Perks Row */}
      <View style={styles.tagsRow}>
        {competition.tags?.map((tag, idx) => (
          <View key={`tag-${idx}`} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}

        {/* Dynamic Perks originating from backend data */}
        {competition.perks?.map((perk, idx) => (
          <View key={`perk-${idx}`} style={styles.perkContainer}>
            <Ionicons name="trophy-outline" size={15} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </View>

      {/* Financials & Capacity Grid */}
      <View style={styles.statsRow}>
        {/* Prize Pool */}
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{prizePoolLabel}</Text>
          <Text style={styles.prizePoolValue}>{formatCurrency(competition.prizePool)}</Text>
        </View>

        {/* Entry Fee */}
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{entryFeeLabel}</Text>
          <Text style={styles.entryFeeValue}>{formatCurrency(competition.entryFee)}</Text>
        </View>

        {/* Capacity / Spots tracker */}
        <View style={styles.capacityCol}>
          <View style={styles.capacityTextRow}>
            <Ionicons name="people-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.spotsLeftText}>{spotsText}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.max(5, progressRatio * 100)}%` }]} />
          </View>

          <Text style={styles.bookedText}>{bookedText}</Text>
        </View>
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
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginRight: 8,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  openBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  fullBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fullBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  perkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  perkText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statCol: {
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  prizePoolValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  entryFeeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  capacityCol: {
    alignItems: 'flex-end',
    width: 120,
  },
  capacityTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotsLeftText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.progressTrack,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.progressFill,
    borderRadius: 2,
  },
  bookedText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
