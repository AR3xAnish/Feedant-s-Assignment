import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const UserReviewsCard = ({ reviews = [] }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Hear From Our Users</Text>
          <Text style={styles.subtitle}>See what participants say about Feedants</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Reviews Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Participant Reviews</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={reviews}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{item.userName}</Text>
                    <View style={styles.starsRow}>
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Ionicons key={i} name="star" size={12} color="#F59E0B" />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{item.comment}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No reviews yet. Be the first to share your thoughts!</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    paddingVertical: 20,
  },
});
