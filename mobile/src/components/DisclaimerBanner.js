import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const DisclaimerBanner = ({ disclaimer }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} style={styles.icon} />
      <Text style={styles.text}>
        <Text style={styles.boldText}>Disclaimer: </Text>
        {disclaimer || 'Only contributions from paid participants will be considered for judging.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
  },
});
