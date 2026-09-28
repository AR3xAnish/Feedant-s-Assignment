import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const HeaderBar = ({ currentLanguage, onToggleLanguage, currentUser, users, onSelectUser }) => {
  const [userModalVisible, setUserModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        <Text style={styles.backText}>Go back</Text>
      </TouchableOpacity>

      {/* Right controls: Demo User Switcher & Language Switcher */}
      <View style={styles.rightGroup}>
        {/* User Switcher Pill for evaluator */}
        {currentUser && (
          <TouchableOpacity
            style={styles.userSwitcherPill}
            onPress={() => setUserModalVisible(true)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: currentUser.avatarUrl }} style={styles.userAvatar} />
            <Text style={styles.userNameText} numberOfLines={1}>
              {currentUser.name.split(' ')[0]}
            </Text>
            <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}

        {/* Language Toggle Pill: ENG | हिंदी */}
        <View style={styles.langContainer}>
          <TouchableOpacity
            style={[styles.langSegment, currentLanguage === 'ENG' && styles.langSegmentActive]}
            onPress={() => onToggleLanguage('ENG')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, currentLanguage === 'ENG' && styles.langTextActive]}>ENG</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langSegment, currentLanguage === 'HI' && styles.langSegmentActive]}
            onPress={() => onToggleLanguage('HI')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, currentLanguage === 'HI' && styles.langTextActive]}>हिंदी</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Switcher Modal */}
      <Modal visible={userModalVisible} transparent animationType="fade" onRequestClose={() => setUserModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setUserModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch Demo User</Text>
              <TouchableOpacity onPress={() => setUserModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Test different participation states (Registered vs Unregistered):
            </Text>
            <FlatList
              data={users}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const isSelected = currentUser?._id === item._id;
                return (
                  <TouchableOpacity
                    style={[styles.userListItem, isSelected && styles.userListItemActive]}
                    onPress={() => {
                      onSelectUser(item);
                      setUserModalVisible(false);
                    }}
                  >
                    <Image source={{ uri: item.avatarUrl }} style={styles.modalUserAvatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.modalUserName, isSelected && { color: COLORS.primary, fontWeight: '700' }]}>
                        {item.name}
                      </Text>
                      <Text style={styles.modalUserEmail}>{item.email}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.screenBg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userSwitcherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  userNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    maxWidth: 60,
  },
  langContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langSegment: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  langSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  langTextActive: {
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  userListItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  modalUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  modalUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalUserEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
