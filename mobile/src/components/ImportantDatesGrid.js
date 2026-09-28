import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { formatDisplayDate } from '../utils/formatters';

export const ImportantDatesGrid = ({ importantDates }) => {
  if (!importantDates) return null;

  const regCloses = formatDisplayDate(importantDates.registrationClosesAt);
  const subStarts = formatDisplayDate(importantDates.submissionStartsAt);
  const subEnds = formatDisplayDate(importantDates.submissionEndsAt);
  const resDate = formatDisplayDate(importantDates.resultDate);

  const items = [
    {
      icon: 'calendar-outline',
      label: 'Register Before',
      date: regCloses.datePart,
      time: regCloses.timePart,
    },
    {
      icon: 'paper-plane-outline',
      label: 'Submission Starts',
      date: subStarts.datePart,
      time: subStarts.timePart,
    },
    {
      icon: 'arrow-up-circle-outline',
      label: 'Submission Ends',
      date: subEnds.datePart,
      time: subEnds.timePart,
    },
    {
      icon: 'trophy-outline',
      label: 'Result Date',
      date: resDate.datePart,
      time: resDate.timePart,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Important Dates</Text>

      <View style={styles.card}>
        {/* Top Row */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.borderRight, styles.borderBottom]}>
            <Ionicons name={items[0].icon} size={22} color={COLORS.primary} style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{items[0].label}</Text>
              <Text style={styles.date}>{items[0].date}</Text>
              <Text style={styles.time}>{items[0].time}</Text>
            </View>
          </View>

          <View style={[styles.cell, styles.borderBottom]}>
            <Ionicons name={items[1].icon} size={22} color={COLORS.primary} style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{items[1].label}</Text>
              <Text style={styles.date}>{items[1].date}</Text>
              <Text style={styles.time}>{items[1].time}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.borderRight]}>
            <Ionicons name={items[2].icon} size={22} color={COLORS.primary} style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{items[2].label}</Text>
              <Text style={styles.date}>{items[2].date}</Text>
              <Text style={styles.time}>{items[2].time}</Text>
            </View>
          </View>

          <View style={styles.cell}>
            <Ionicons name={items[3].icon} size={22} color={COLORS.primary} style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{items[3].label}</Text>
              <Text style={styles.date}>{items[3].date}</Text>
              <Text style={styles.time}>{items[3].time}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 1,
  },
  time: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
