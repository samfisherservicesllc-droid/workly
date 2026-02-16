import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, ReportReason } from '../types';

interface ReportsState {
  reports: Report[];

  // Actions
  submitReport: (report: Omit<Report, 'id' | 'status' | 'createdAt'>) => void;
  hasReportedUser: (reporterId: string, reportedUserId: string) => boolean;
  getReportsBy: (reporterId: string) => Report[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Threatening, bullying, or abusive behavior',
  },
  {
    value: 'spam',
    label: 'Spam',
    description: 'Unwanted promotional content or messages',
  },
  {
    value: 'fake_profile',
    label: 'Fake Profile',
    description: 'Impersonation or misleading identity',
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Offensive photos, language, or material',
  },
  {
    value: 'scam',
    label: 'Scam or Fraud',
    description: 'Attempting to deceive or defraud users',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other violation not listed above',
  },
];

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: [],

      submitReport: (reportData) => {
        const newReport: Report = {
          ...reportData,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          reports: [newReport, ...state.reports],
        }));
      },

      hasReportedUser: (reporterId, reportedUserId) => {
        return get().reports.some(
          (r) => r.reporterId === reporterId && r.reportedUserId === reportedUserId
        );
      },

      getReportsBy: (reporterId) => {
        return get().reports.filter((r) => r.reporterId === reporterId);
      },
    }),
    {
      name: 'reports-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
