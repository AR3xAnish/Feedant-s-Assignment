import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { formatCurrency } from '../utils/formatters';

// 1. Registration Confirmation Modal (Razorpay Flow)
export const RegistrationModal = ({
  visible,
  onClose,
  competition,
  onConfirmRegistration,
  isProcessing,
  error,
}) => {
  if (!competition) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Participation</Text>
            <TouchableOpacity onPress={onClose} disabled={isProcessing}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <Text style={styles.compName}>{competition.title}</Text>

          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Entry Fee:</Text>
              <Text style={styles.detailValue}>{formatCurrency(competition.entryFee)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Mode:</Text>
              <Text style={styles.detailValue}>Razorpay Secure Demo</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Spots Left:</Text>
              <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                {competition.maxParticipants - competition.bookedSpots} spots
              </Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isProcessing}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.payButton}
              onPress={onConfirmRegistration}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.payText}>Pay {formatCurrency(competition.entryFee)}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 2. Video Submission Modal
export const SubmissionModal = ({
  visible,
  onClose,
  onSubmitEntry,
  isProcessing,
  error,
}) => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://storage.googleapis.com/feedants-entries/kathak_demo.mp4');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmitEntry({ title, videoUrl, description });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Submission</Text>
            <TouchableOpacity onPress={onClose} disabled={isProcessing}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Performance Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Kathak Tarana in Teentaal"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Video Link / File URL *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://..."
            value={videoUrl}
            onChangeText={setVideoUrl}
          />

          <Text style={styles.label}>Additional Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, { height: 60 }]}
            placeholder="Choreographer, raag or taal details..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.payButton, !title.trim() && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!title.trim() || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.payText}>Submit Entry</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// 3. Video Playback / Media Modal
export const VideoModal = ({ visible, onClose, item, title }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.videoOverlay}>
        <View style={styles.videoPlayerBox}>
          <View style={styles.videoHeader}>
            <Text style={styles.videoTitle} numberOfLines={1}>{title || 'Video Preview'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.mockPlayer}>
            <Ionicons name="play-circle" size={64} color={COLORS.primary} />
            <Text style={styles.playingText}>Streaming Demo Media</Text>
            <Text style={styles.playerSubtext}>Format: MP4 (1080p 60fps)</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  compName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  payButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  videoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  videoPlayerBox: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    marginRight: 10,
  },
  mockPlayer: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  playingText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  playerSubtext: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
