import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const JudgeCard = ({ judge, onPlayIntroVideo }) => {
  if (!judge) return null;

  return (
    <View style={styles.card}>
      {/* Judge Avatar */}
      <Image source={{ uri: judge.avatarUrl }} style={styles.avatar} />

      {/* Judge Info Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.judgeLabel}>Judge</Text>
        <Text style={styles.judgeName}>{judge.name}</Text>
        <Text style={styles.judgeTitle}>{judge.title}</Text>
        <Text style={styles.judgeExp}>{judge.experience}</Text>
      </View>

      {/* Intro Video Button */}
      <TouchableOpacity
        style={styles.videoButtonContainer}
        onPress={() => onPlayIntroVideo?.(judge)}
        activeOpacity={0.8}
      >
        <View style={styles.playCircle}>
          <Ionicons name="play" size={16} color={COLORS.playButtonIcon} style={{ marginLeft: 2 }} />
        </View>
        <Text style={styles.videoButtonText}>Intro Video</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  judgeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  judgeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  judgeTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  judgeExp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  videoButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.playButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  videoButtonText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
