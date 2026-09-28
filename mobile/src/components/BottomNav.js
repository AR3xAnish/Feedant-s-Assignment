import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const BottomNav = ({ activeTab = 'Competitions', userAvatar }) => {
  return (
    <View style={styles.container}>
      {/* 1. Home */}
      <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
        <Ionicons name="home-outline" size={22} color={COLORS.textMuted} />
        <Text style={styles.tabLabel}>Home</Text>
      </TouchableOpacity>

      {/* 2. Explore */}
      <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
        <Ionicons name="search-outline" size={22} color={COLORS.textMuted} />
        <Text style={styles.tabLabel}>Explore</Text>
      </TouchableOpacity>

      {/* 3. Center Create (+) Button */}
      <TouchableOpacity style={styles.createButtonContainer} activeOpacity={0.85}>
        <View style={styles.createCircle}>
          <Ionicons name="add" size={26} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      {/* 4. Competitions (Active) */}
      <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
        <Ionicons name="trophy" size={22} color={COLORS.primary} />
        <Text style={[styles.tabLabel, styles.activeTabLabel]}>Competitions</Text>
      </TouchableOpacity>

      {/* 5. Profile */}
      <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={24} color={COLORS.textMuted} />
        )}
        <Text style={styles.tabLabel}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  createButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  createCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});
