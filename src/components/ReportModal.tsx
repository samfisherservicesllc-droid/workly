import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, AlertTriangle, Check, ChevronRight } from 'lucide-react-native';
import { useReportsStore, REPORT_REASONS } from '@/lib/state/reports-store';
import { useAuthStore } from '@/lib/state/auth-store';
import { ReportReason } from '@/lib/types';
import * as Haptics from 'expo-haptics';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
}

export default function ReportModal({
  visible,
  onClose,
  reportedUserId,
  reportedUserName,
}: ReportModalProps) {
  const user = useAuthStore((s) => s.user);
  const submitReport = useReportsStore((s) => s.submitReport);
  const hasReportedUser = useReportsStore((s) => s.hasReportedUser);

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<'reason' | 'details' | 'success'>('reason');
  const [error, setError] = useState('');

  const alreadyReported = user ? hasReportedUser(user.id, reportedUserId) : false;

  const handleSelectReason = (reason: ReportReason) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReason(reason);
    setStep('details');
  };

  const handleSubmit = () => {
    if (!user || !selectedReason) return;

    if (!description.trim()) {
      setError('Please provide details about the issue');
      return;
    }

    submitReport({
      reporterId: user.id,
      reporterName: user.name,
      reportedUserId,
      reportedUserName,
      reason: selectedReason,
      description: description.trim(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep('success');
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    setStep('reason');
    setError('');
    onClose();
  };

  const renderReasonStep = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-6">
        <View className="w-16 h-16 bg-red-500/20 rounded-full items-center justify-center mb-4">
          <AlertTriangle color="#EF4444" size={32} />
        </View>
        <Text className="text-white text-xl font-bold text-center">
          Report {reportedUserName}
        </Text>
        <Text className="text-slate-400 text-center mt-2">
          Select the reason for your report
        </Text>
      </View>

      {alreadyReported ? (
        <View className="bg-workly-bg-input rounded-xl p-4 mb-4">
          <Text className="text-slate-300 text-center">
            You have already reported this user. Our team will review your report.
          </Text>
        </View>
      ) : (
        <View className="space-y-2">
          {REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason.value}
              onPress={() => handleSelectReason(reason.value)}
              className="bg-workly-bg-card rounded-xl p-4 flex-row items-center justify-between active:bg-workly-bg-input mb-2"
            >
              <View className="flex-1 mr-3">
                <Text className="text-white font-medium">{reason.label}</Text>
                <Text className="text-slate-400 text-sm mt-0.5">
                  {reason.description}
                </Text>
              </View>
              <ChevronRight color="#5A7A82" size={20} />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderDetailsStep = () => {
    const selectedReasonInfo = REPORT_REASONS.find((r) => r.value === selectedReason);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="text-white text-lg font-semibold">
              {selectedReasonInfo?.label}
            </Text>
            <Text className="text-slate-400 text-sm mt-1">
              {selectedReasonInfo?.description}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-white font-medium mb-2">
              Describe the issue <Text className="text-red-400">*</Text>
            </Text>
            <TextInput
              className="bg-workly-bg-card rounded-xl px-4 py-3 text-white text-base border border-workly-border min-h-[120px]"
              placeholder="Please provide specific details about what happened..."
              placeholderTextColor="#5A7A82"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setError('');
              }}
              multiline
              textAlignVertical="top"
            />
            {error ? (
              <Text className="text-red-400 text-sm mt-2">{error}</Text>
            ) : null}
          </View>

          <View className="bg-workly-bg-card/50 rounded-xl p-4 mb-6">
            <Text className="text-slate-400 text-sm">
              Your report will be reviewed by our team. We may contact you for
              additional information. False reports may result in action against your
              account.
            </Text>
          </View>

          <View className="flex-row space-x-3">
            <Pressable
              onPress={() => {
                setStep('reason');
                setError('');
              }}
              className="flex-1 bg-workly-bg-card py-4 rounded-xl mr-2"
            >
              <Text className="text-slate-300 text-center font-medium">Back</Text>
            </Pressable>
            <Pressable onPress={handleSubmit} className="flex-1 ml-2">
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, paddingVertical: 16 }}
              >
                <Text className="text-white text-center font-semibold">
                  Submit Report
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderSuccessStep = () => (
    <View className="flex-1 items-center justify-center">
      <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-6">
        <Check color="#22C55E" size={40} />
      </View>
      <Text className="text-white text-xl font-bold text-center mb-2">
        Report Submitted
      </Text>
      <Text className="text-slate-400 text-center mb-8 px-4">
        Thank you for helping keep Workly safe. Our team will review your report
        and take appropriate action.
      </Text>
      <Pressable onPress={handleClose} className="w-full">
        <LinearGradient
          colors={['#4A9BAD', '#3A7A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 12, paddingVertical: 16 }}
        >
          <Text className="text-white text-center font-semibold">Done</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-workly-bg-dark">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-workly-border">
          <View className="w-10" />
          <Text className="text-white text-lg font-semibold">
            {step === 'success' ? 'Report Sent' : 'Report User'}
          </Text>
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 items-center justify-center"
          >
            <X color="#5A7A82" size={24} />
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 pt-6 pb-8">
          {step === 'reason' && renderReasonStep()}
          {step === 'details' && renderDetailsStep()}
          {step === 'success' && renderSuccessStep()}
        </View>
      </View>
    </Modal>
  );
}
