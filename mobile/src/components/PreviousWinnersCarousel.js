import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const PreviousWinnersCarousel = ({ winners, onSelectWinner }) => {
  if (!winners || winners.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Previous Winners</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {winners.map((winner, idx) => {
          const isFirst = winner.rank.includes('1st');
          const isSecond = winner.rank.includes('2nd');

          return (
            <TouchableOpacity
              key={idx}
              style={styles.card}
              onPress={() => onSelectWinner?.(winner)}
              activeOpacity={0.8}
            >
              {/* Thumbnail with overlay play icon */}
              <View style={styles.thumbnailWrapper}>
                <Image source={{ uri: winner.videoThumbnail }} style={styles.thumbnail} />
                <View style={styles.playOverlay}>
                  <View style={styles.playIconCircle}>
                    <Ionicons name="play" size={14} color={COLORS.primary} style={{ marginLeft: 2 }} />
                  </View>
                </View>
              </View>

              {/* Winner Name & Rank */}
              <View style={styles.infoWrapper}>
                <Text style={styles.winnerName} numberOfLines={1}>
                  {winner.name}
                </Text>
                <Text
                  style={[
                    styles.rankBadgeText,
                    isFirst && styles.firstRank,
                    isSecond && styles.secondRank,
                  ]}
                  numberOfLines={1}
                >
                  {winner.rank}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 140,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  thumbnailWrapper: {
    width: '100%',
    height: 95,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 6,
  },
  playIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoWrapper: {
    marginTop: 8,
  },
  winnerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  firstRank: {
    color: COLORS.primary,
  },
  secondRank: {
    color: '#0284C7',
  },
});
