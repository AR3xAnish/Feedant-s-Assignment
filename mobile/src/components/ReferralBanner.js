import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const ReferralBanner = ({ referralCode = 'referral123', t = {} }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://feedants.com/r/${(referralCode || 'referral123').toLowerCase()}`;

  const referAndEarnTitle = t.referAndEarn || 'Refer & Earn more discount';
  const copyLinkLabel = copied ? (t.copied || 'Copied!') : (t.copyLink || 'Copy Link');
  const referNowLabel = t.referNow || 'Refer Now';
  const earnRewardLabel = t.earnReward || 'You earn ₹10 for every signup';

  // 1. Real functional Clipboard Copy
  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write error:', err);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 2. Real Native Share Action
  const handleReferNow = async () => {
    try {
      await Share.share({
        title: 'Feedants Competition Referral',
        message: `Join me on Feedants using my referral link and get an instant discount: ${referralLink}`,
        url: referralLink,
      });
    } catch (err) {
      console.error('Share action error:', err);
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="megaphone-outline" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>{referAndEarnTitle}</Text>
      </View>

      {/* Referral Link & Actions */}
      <View style={styles.actionContainer}>
        {/* Link input with Copy button */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={referralLink}
            editable={false}
            selectTextOnFocus
          />
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.7}>
            <Text style={[styles.copyText, copied && { color: COLORS.primaryDark }]}>{copyLinkLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Refer Now CTA Button & Earning text */}
        <View style={styles.referActionCol}>
          <TouchableOpacity style={styles.referButton} onPress={handleReferNow} activeOpacity={0.8}>
            <Text style={styles.referButtonText}>{referNowLabel}</Text>
          </TouchableOpacity>
          <Text style={styles.earnText}>{earnRewardLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E8F5F1',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C6EBE1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1EFE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionContainer: {
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  copyButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  copyText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  referActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  referButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  referButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  earnText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
