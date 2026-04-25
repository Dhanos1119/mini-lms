"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Types ---

export interface Student {
  id: number;
  name: string;
  email: string;
  batch: string;
  phone: string;
  totalPaid: number;
  status: string;
  courseDuration: number; // in years
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
  id: number;
  title: string;
  batch: string;
  description: string;
  dueDate: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  statusMap?: Record<string, string>; // email -> status
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
  role: 'admin' | 'user';
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
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  resetTokens: ResetToken[];
  setResetTokens: React.Dispatch<React.SetStateAction<ResetToken[]>>;
  showAssignmentModal: boolean;
  setShowAssignmentModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// --- Initial Mock Data ---

const initialStudentsData: Student[] = [
  { id: 1, name: 'John Doe', email: 'user@example.com', batch: 'Batch A - React', phone: '+1234567890', totalPaid: 20000, status: 'Active', courseDuration: 4, joinedYear: 2024 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', batch: 'Batch B - Node.js', phone: '+0987654321', totalPaid: 10000, status: 'Active', courseDuration: 3, joinedYear: 2025 },
];

const initialBatchesData: Batch[] = [
  { id: 1, name: 'Batch A - React', instructor: 'Dr. Sarah Wilson', studentsCount: '0', schedule: 'Mon/Wed 6PM', description: 'Advanced React patterns and hooks.', startDate: '2023-11-01', endDate: '2024-02-01' },
  { id: 2, name: 'Batch B - Node.js', instructor: 'Prof. Mark Thompson', studentsCount: '0', schedule: 'Tue/Thu 7PM', description: 'Backend API design using Express.', startDate: '2023-11-15', endDate: '2024-02-15' },
  { id: 3, name: 'Batch C - UI/UX', instructor: 'Elena Rodriguez', studentsCount: '0', schedule: 'Sat 10AM', description: 'Design fundamentals with Figma.', startDate: '2023-12-05', endDate: '2024-03-05' },
];

const initialAssignmentsData: Assignment[] = [
  { id: 1, title: 'React Hooks Project', batch: 'Batch A - React', description: 'Implement a custom hook library supporting local storage.', dueDate: '2023-11-10', status: 'Active', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'react_hooks.pdf', statusMap: { 'user@example.com': 'Completed' } },
  { id: 2, title: 'Express API Design', batch: 'Batch B - Node.js', description: 'Design RESTful routes for a mock e-commerce backend.', dueDate: '2023-11-12', status: 'Grading', fileUrl: '', fileName: '', statusMap: {} },
  { id: 3, title: 'Figma Auto Layout', batch: 'Batch C - UI/UX', description: 'Create a fully responsive mobile wireframe.', dueDate: '2023-11-15', status: 'Active', fileUrl: '', fileName: '', statusMap: {} },
  { id: 4, title: 'Next.js App Router', batch: 'Batch A - React', description: 'Migrate a pages/ project to the app/ directory using Layouts.', dueDate: '2023-11-20', status: 'Upcoming', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'nextjs_router.pdf', statusMap: { 'user@example.com': 'Pending' } },
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
  { id: 1, email: 'admin@minilms.com', password: 'password123', role: 'admin' },
  { id: 2, email: 'user@example.com', password: 'password123', role: 'user' },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudentsData);
  const [batches, setBatches] = useState<Batch[]>(initialBatchesData);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignmentsData);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncementsData);
  const [payments, setPayments] = useState<Payment[]>(initialPaymentsData);

  const [users, setUsers] = useState<User[]>(initialUsersData);
  const [resetTokens, setResetTokens] = useState<ResetToken[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  return (
    <DataContext.Provider value={{
      students, setStudents,
      batches, setBatches,
      assignments, setAssignments,
      announcements, setAnnouncements,
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
