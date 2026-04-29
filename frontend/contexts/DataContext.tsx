"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

// --- Types ---

export interface Student {
  id: number | string;
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
  id: number | string;
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
  batchId?: string;
  description: string;
  dueDate: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  statusMap?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  id: number | string;
  title: string;
  content: string;
  batch: string;
  batchId?: string;
  date: string;
  createdAt?: string;
}

export interface User {
  id: number | string;
  email: string;
  password?: string;
  role: "admin" | "user" | "ADMIN" | "STUDENT";
}

export interface ResetToken {
  token: string;
  email: string;
  expiry: number;
}

export interface Payment {
  id: number | string;
  studentName: string;
  email: string;
  amount: number;
  year: number;
  academicYear?: number;
  status: string;
  paidDate: string;
  batch: string;
}

interface DataContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  refreshStudents: () => Promise<void>;

  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  refreshBatches: () => Promise<void>;

  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  refreshAssignments: () => Promise<void>;

  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  refreshAnnouncements: () => Promise<void>;

  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  refreshPayments: () => Promise<void>;

  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  resetTokens: ResetToken[];
  setResetTokens: React.Dispatch<React.SetStateAction<ResetToken[]>>;

  showAssignmentModal: boolean;
  setShowAssignmentModal: React.Dispatch<React.SetStateAction<boolean>>;

  refreshAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // ✅ No mock data here. All start empty and load from DB.
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [resetTokens, setResetTokens] = useState<ResetToken[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fetchJsonArray = async (
    url: string,
    options: RequestInit = {}
  ): Promise<any[]> => {
    try {
      const res = await fetch(url, options);

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        console.error("API did not return JSON:", url);
        return [];
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", url, data);
        return [];
      }

      if (Array.isArray(data)) return data;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.students)) return data.students;
      if (Array.isArray(data.batches)) return data.batches;
      if (Array.isArray(data.assignments)) return data.assignments;
      if (Array.isArray(data.announcements)) return data.announcements;
      if (Array.isArray(data.payments)) return data.payments;

      return [];
    } catch (error) {
      console.error("Fetch failed:", url, error);
      return [];
    }
  };

  // ─── Students from DB ───────────────────────────────────────────────
  const refreshStudents = useCallback(async () => {
    if (!API_URL) return;

    const token = getToken();
    if (!token) return;

    const data = await fetchJsonArray(`${API_URL}/admin/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const mapped: Student[] = data.map((student: any) => ({
      id: student.id,
      name: student.name || "",
      email: student.email || "",
      batch: student.batch || student.batchId || "",
      batchId: student.batchId || student.batch || "",
      phone: student.phone || student.phoneNumber || "",
      phoneNumber: student.phoneNumber || student.phone || "",
      totalPaid: Number(student.totalPaid || 0),
      status: student.status || "Active",
      courseDuration: Number(student.courseDuration || 0),
      joinedYear: Number(student.joinedYear || new Date().getFullYear()),
    }));

    setStudents(mapped);

    const mappedUsers: User[] = data.map((student: any) => ({
      id: student.id,
      email: student.email || "",
      role: student.role || "STUDENT",
    }));

    setUsers(mappedUsers);
  }, [API_URL]);

  // ─── Batches from DB ────────────────────────────────────────────────
  const refreshBatches = useCallback(async () => {
    if (!API_URL) return;

    const data = await fetchJsonArray(`${API_URL}/batches`);

    const mapped: Batch[] = data.map((batch: any) => ({
      id: batch.id,
      name: batch.name || "",
      instructor: batch.instructor || "",
      studentsCount: String(batch.studentsCount || batch.students || "0"),
      schedule: batch.schedule || "",
      description: batch.description || "",
      startDate: batch.startDate || "",
      endDate: batch.endDate || "",
    }));

    setBatches(mapped);
  }, [API_URL]);

  // ─── Assignments from DB ────────────────────────────────────────────
  const refreshAssignments = useCallback(async () => {
    if (!API_URL) return;

    const token = getToken();
    if (!token) return;

    const data = await fetchJsonArray(`${API_URL}/assignments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const mapped: Assignment[] = data.map((assignment: any) => ({
      id: assignment.id,
      title: assignment.title || "",
      batch: assignment.batch || assignment.batchId || "",
      batchId: assignment.batchId || assignment.batch || "",
      description: assignment.description || "",
      dueDate: assignment.dueDate ? formatDate(assignment.dueDate) : "",
      status: assignment.status || "Active",
      fileUrl: assignment.fileUrl || "",
      fileName: assignment.fileName || "",
      statusMap: assignment.statusMap || {},
      createdAt: assignment.createdAt || "",
      updatedAt: assignment.updatedAt || "",
    }));

    setAssignments(mapped);
  }, [API_URL]);

  // ─── Announcements from DB ──────────────────────────────────────────
  const refreshAnnouncements = useCallback(async () => {
    if (!API_URL) return;

    const token = getToken();
    if (!token) return;

    const data = await fetchJsonArray(`${API_URL}/assignments/announcements`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const mapped: Announcement[] = data.map((announcement: any) => ({
      id: announcement.id,
      title: announcement.title || "",
      content: announcement.content || "",
      batch: announcement.batch || announcement.batchId || "All Batches",
      batchId: announcement.batchId || announcement.batch || "All Batches",
      date: formatDate(announcement.createdAt || announcement.date),
      createdAt: announcement.createdAt || "",
    }));

    setAnnouncements(mapped);
  }, [API_URL]);

  // ─── Payments from DB ───────────────────────────────────────────────
  const refreshPayments = useCallback(async () => {
    if (!API_URL) return;

    const data = await fetchJsonArray(`${API_URL}/payments`);

    const mapped: Payment[] = data.map((payment: any) => ({
      id: payment.id,
      studentName: payment.studentName || "",
      email: payment.email || "",
      amount: Number(payment.amount || 0),
      year: Number(payment.academicYear || payment.year || 1),
      academicYear: Number(payment.academicYear || payment.year || 1),
      status: payment.status || "Paid",
      paidDate: payment.paidDate || "",
      batch: payment.batch || "",
    }));

    setPayments(mapped);
  }, [API_URL]);

  // ─── Refresh All Data ───────────────────────────────────────────────
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refreshStudents(),
      refreshBatches(),
      refreshAssignments(),
      refreshAnnouncements(),
      refreshPayments(),
    ]);
  }, [
    refreshStudents,
    refreshBatches,
    refreshAssignments,
    refreshAnnouncements,
    refreshPayments,
  ]);

  // ✅ Load real DB data when app starts/refreshed
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  return (
    <DataContext.Provider
      value={{
        students,
        setStudents,
        refreshStudents,

        batches,
        setBatches,
        refreshBatches,

        assignments,
        setAssignments,
        refreshAssignments,

        announcements,
        setAnnouncements,
        refreshAnnouncements,

        payments,
        setPayments,
        refreshPayments,

        users,
        setUsers,

        resetTokens,
        setResetTokens,

        showAssignmentModal,
        setShowAssignmentModal,

        refreshAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }

  return context;
}