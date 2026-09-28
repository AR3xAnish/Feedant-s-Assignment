import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const AdBanner = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="megaphone-outline" size={16} color={COLORS.textMuted} style={styles.icon} />
      <Text style={styles.text}>Ad Here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
