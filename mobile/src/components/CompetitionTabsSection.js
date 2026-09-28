import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const CompetitionTabsSection = ({ competition }) => {
  const [activeTab, setActiveTab] = useState('ABOUT'); // 'ABOUT' | 'JUDGING' | 'RULES'
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { key: 'ABOUT', title: 'About Competition' },
    { key: 'JUDGING', title: 'Judging Parameters' },
    { key: 'RULES', title: 'Rules & Eligibility' },
  ];

  return (
    <View style={styles.card}>
      {/* Tab Navigation Header */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content Body */}
      <View style={styles.contentBody}>
        {activeTab === 'ABOUT' && (
          <View>
            <Text style={styles.paragraph}>
              This is an online classical dance competition open for all age groups.
            </Text>
            <Text style={styles.paragraph}>Participate from anywhere and showcase your talent.</Text>
            <Text style={styles.paragraph}>Express your passion through traditional dance.</Text>

            {isExpanded && (
              <View style={styles.expandedContent}>
                <Text style={styles.subheading}>Accepted Dance Styles:</Text>
                <Text style={styles.listItem}>• Bharatanatyam, Kathak, Odissi, Kuchipudi</Text>
                <Text style={styles.listItem}>• Mohiniyattam, Manipuri, Kathakali, Sattriya</Text>
                <Text style={styles.subheading}>Evaluation:</Text>
                <Text style={styles.listItem}>• Evaluated by recognized Kathak master Manju Dubey.</Text>
                <Text style={styles.listItem}>• Official digital certificates will be awarded to all verified participants.</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewMoreText}>{isExpanded ? 'View less' : 'View more'}</Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.primary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'JUDGING' && (
          <View>
            <Text style={styles.criteriaHeader}>How entries are scored (100 Points Total):</Text>
            {competition.judgingCriteria?.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primary} style={styles.bulletIcon} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'RULES' && (
          <View>
            <Text style={styles.criteriaHeader}>Important Guidelines & Eligibility:</Text>
            {competition.rulesAndEligibility?.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} style={styles.bulletIcon} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  contentBody: {
    padding: 16,
  },
  paragraph: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 2,
  },
  criteriaHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
