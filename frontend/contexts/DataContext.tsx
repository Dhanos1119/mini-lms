"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// --- Types ---

export interface Student {
  id: number;
  name: string;
  email: string;
  batch: string;
  batchId?: string;
  phone: string;
  phoneNumber?: string;
  totalPaid: number;
  status: string;
  courseDuration: number;
  joinedYear: number;
}

export interface Batch {
  id: number;
  name: string;
  instructor: string;
  studentsCount: string;
  schedule: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Assignment {
  id: number | string;
  title: string;
  batch: string;
  description: string;
  dueDate: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  statusMap?: Record<string, string>;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  batch: string;
  date: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'ADMIN' | 'STUDENT';
}

export interface ResetToken {
  token: string;
  email: string;
  expiry: number;
}

export interface Payment {
  id: number;
  studentName: string;
  email: string;
  amount: number;
  year: number;
  status: string;
  paidDate: string;
  batch: string;
}

interface DataContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  refreshAssignments: () => Promise<void>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  refreshAnnouncements: () => Promise<void>;  // ← Shared fetch
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  resetTokens: ResetToken[];
  setResetTokens: React.Dispatch<React.SetStateAction<ResetToken[]>>;
  showAssignmentModal: boolean;
  setShowAssignmentModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// --- Initial Mock Data (used as fallback until API responds) ---

const initialBatchesData: Batch[] = [
  { id: 1, name: 'Batch A - React', instructor: 'Dr. Sarah Wilson', studentsCount: '0', schedule: 'Mon/Wed 6PM', description: 'Advanced React patterns and hooks.', startDate: '2023-11-01', endDate: '2024-02-01' },
  { id: 2, name: 'Batch B - Node.js', instructor: 'Prof. Mark Thompson', studentsCount: '0', schedule: 'Tue/Thu 7PM', description: 'Backend API design using Express.', startDate: '2023-11-15', endDate: '2024-02-15' },
  { id: 3, name: 'Batch C - UI/UX', instructor: 'Elena Rodriguez', studentsCount: '0', schedule: 'Sat 10AM', description: 'Design fundamentals with Figma.', startDate: '2023-12-05', endDate: '2024-03-05' },
];

const initialAnnouncementsData: Announcement[] = [
  { id: 1, title: 'Final Submission Reminder', content: 'Please ensure all assignments are submitted before the deadline next week.', batch: 'All Batches', date: 'Oct 24, 2023' },
  { id: 2, title: 'Class Rescheduled', content: 'Batch B Node.js class is rescheduled to 8 PM tomorrow.', batch: 'Batch B - Node.js', date: 'Oct 22, 2023' },
];

const initialPaymentsData: Payment[] = [
  { id: 1, studentName: 'John Doe', email: 'user@example.com', batch: 'Batch A - React', amount: 10000, year: 2024, status: 'Paid', paidDate: '2024-05-15' },
  { id: 2, studentName: 'John Doe', email: 'user@example.com', batch: 'Batch A - React', amount: 10000, year: 2025, status: 'Paid', paidDate: '2025-01-10' },
  { id: 3, studentName: 'Jane Smith', email: 'jane@example.com', batch: 'Batch B - Node.js', amount: 10000, year: 2025, status: 'Paid', paidDate: '2025-02-20' },
];

const initialUsersData: User[] = [
  { id: 1, email: 'admin@gmail.com', password: '', role: 'ADMIN' },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>(initialBatchesData);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [payments, setPayments] = useState<Payment[]>(initialPaymentsData);
  const [users, setUsers] = useState<User[]>(initialUsersData);
  const [resetTokens, setResetTokens] = useState<ResetToken[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // ─── Shared refreshAssignments ────────────────────────────────────────────
  const refreshAssignments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) return;
      const data = await res.json();

      const mapped: Assignment[] = data.map((a: any) => ({
        id: a.id,
        title: a.title,
        batch: a.batchId,
        description: a.description || '',
        dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '',
        status: 'Active',
        fileUrl: a.fileUrl || '',
        fileName: '',
        statusMap: {}
      }));

      setAssignments(mapped);
    } catch (err) {
      console.error('refreshAssignments failed:', err);
    }
  }, []);

  // ─── Shared refreshAnnouncements ──────────────────────────────────────────
  const refreshAnnouncements = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/announcements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) return;
      const data = await res.json();

      const mapped: Announcement[] = data.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        batch: a.batchId,
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }));

      setAnnouncements(mapped);
    } catch (err) {
      console.error('refreshAnnouncements failed:', err);
    }
  }, []);

  return (
    <DataContext.Provider value={{
      students, setStudents,
      batches, setBatches,
      assignments, setAssignments, refreshAssignments,
      announcements, setAnnouncements, refreshAnnouncements,
      payments, setPayments,
      users, setUsers,
      resetTokens, setResetTokens,
      showAssignmentModal, setShowAssignmentModal
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
