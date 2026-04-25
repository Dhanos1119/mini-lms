"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Types ---

export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  batch: string;
  status: string;
  paymentStatus: string;
  totalPaid: string;
  assignments: Array<{ title: string; status: string }>;
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
}

export interface Announcement {
  id: number;
  text: string;
  batch: string;
  date: string;
}

export interface Payment {
  id: number;
  studentName: string;
  email: string;
  batch: string;
  amount: string;
  status: string;
  paymentDate: string;
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
}

// --- Initial Mock Data ---

const initialStudentsData: Student[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8901', batch: 'Batch A - React', status: 'Active', paymentStatus: 'Paid', totalPaid: '$500.00', assignments: [{ title: 'React Hooks Project', status: 'Completed' }, { title: 'Next.js App Router', status: 'Pending' }] },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 987 654 3210', batch: 'Batch B - Node.js', status: 'Active', paymentStatus: 'Unpaid', totalPaid: '$0.00', assignments: [{ title: 'Express API Design', status: 'Pending' }] },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 555 123 4567', batch: 'Batch A - React', status: 'Inactive', paymentStatus: 'Paid', totalPaid: '$500.00', assignments: [{ title: 'React Hooks Project', status: 'Completed' }] },
  { id: 4, name: 'Emily Brown', email: 'emily@example.com', phone: '+1 444 987 6543', batch: 'Batch C - UI/UX', status: 'Active', paymentStatus: 'Unpaid', totalPaid: '$250.00', assignments: [{ title: 'Figma Auto Layout', status: 'Completed' }] },
];

const initialBatchesData: Batch[] = [
  { id: 1, name: 'Batch A - React', instructor: 'Dr. Sarah Wilson', studentsCount: '0', schedule: 'Mon/Wed 6PM', description: 'Advanced React patterns and hooks.', startDate: '2023-11-01', endDate: '2024-02-01' },
  { id: 2, name: 'Batch B - Node.js', instructor: 'Prof. Mark Thompson', studentsCount: '0', schedule: 'Tue/Thu 7PM', description: 'Backend API design using Express.', startDate: '2023-11-15', endDate: '2024-02-15' },
  { id: 3, name: 'Batch C - UI/UX', instructor: 'Elena Rodriguez', studentsCount: '0', schedule: 'Sat 10AM', description: 'Design fundamentals with Figma.', startDate: '2023-12-05', endDate: '2024-03-05' },
];

const initialAssignmentsData: Assignment[] = [
  { id: 1, title: 'React Hooks Project', batch: 'Batch A - React', description: 'Implement a custom hook library supporting local storage.', dueDate: '2023-11-10', status: 'Active' },
  { id: 2, title: 'Express API Design', batch: 'Batch B - Node.js', description: 'Design RESTful routes for a mock e-commerce backend.', dueDate: '2023-11-12', status: 'Grading' },
  { id: 3, title: 'Figma Auto Layout', batch: 'Batch C - UI/UX', description: 'Create a fully responsive mobile wireframe.', dueDate: '2023-11-15', status: 'Active' },
  { id: 4, title: 'Next.js App Router', batch: 'Batch A - React', description: 'Migrate a pages/ project to the app/ directory using Layouts.', dueDate: '2023-11-20', status: 'Upcoming' },
];

const initialAnnouncementsData: Announcement[] = [
  { id: 1, text: 'Please ensure all assignments are submitted before the deadline next week.', batch: 'All Batches', date: 'Oct 24, 2023' },
  { id: 2, text: 'Batch B Node.js class is rescheduled to 8 PM tomorrow.', batch: 'Batch B - Node.js', date: 'Oct 22, 2023' },
];

const initialPaymentsData: Payment[] = [
  { id: 1, studentName: 'John Doe', email: 'john@example.com', batch: 'Batch A - React', amount: '$500.00', status: 'Paid', paymentDate: '2023-10-15' },
  { id: 2, studentName: 'Jane Smith', email: 'jane@example.com', batch: 'Batch B - Node.js', amount: '$500.00', status: 'Unpaid', paymentDate: '' },
  { id: 3, studentName: 'Mike Johnson', email: 'mike@example.com', batch: 'Batch A - React', amount: '$250.00', status: 'Paid', paymentDate: '2023-10-20' },
  { id: 4, studentName: 'Emily Brown', email: 'emily@example.com', batch: 'Batch C - UI/UX', amount: '$750.00', status: 'Unpaid', paymentDate: '' },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudentsData);
  const [batches, setBatches] = useState<Batch[]>(initialBatchesData);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignmentsData);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncementsData);
  const [payments, setPayments] = useState<Payment[]>(initialPaymentsData);

  return (
    <DataContext.Provider value={{
      students, setStudents,
      batches, setBatches,
      assignments, setAssignments,
      announcements, setAnnouncements,
      payments, setPayments
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
