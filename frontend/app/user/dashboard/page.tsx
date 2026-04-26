"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  CreditCard,
  User as UserIcon,
  LogOut,
  GraduationCap,
  Clock,
  CheckCircle,
  Wallet,
  Phone,
  Mail,
  Edit2,
  Save,
  X,
  Calendar,
  Download,
  FileText,
  Megaphone,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
  const router = useRouter();
  const { students, users } = useData();

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dbStudentProfile, setDbStudentProfile] = useState<any>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);
  const [studentAnnouncements, setStudentAnnouncements] = useState<any[]>([]);
  const [studentDbPayments, setStudentDbPayments] = useState<any[]>([]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const safeLocalStorage = (key: string) => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(key) || "";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");

    if (!token || role?.toUpperCase() !== "STUDENT") {
      router.push("/login");
      return;
    }

    const matchedUser =
      users.find((u: any) => u.email === userEmail) || {
        email: userEmail,
        name: userName || "Student User",
        role: "STUDENT",
      };

    setCurrentUser(matchedUser);

    const fetchStudentProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/student-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error(data.error || "Failed to fetch student profile");
          return;
        }

        setDbStudentProfile(data);
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      }
    };

    const fetchAssignments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/assignments/student`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setStudentAssignments(
            data.map((a: any) => ({
              ...a,
              batch: a.batchId,
              dueDate: a.dueDate
                ? new Date(a.dueDate).toLocaleDateString()
                : "",
              status: "Active",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch student assignments:", err);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/assignments/announcements`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setStudentAnnouncements(
            data.map((a: any) => ({
              id: a.id,
              title: a.title,
              content: a.content,
              batch: a.batchId,
              date: new Date(a.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch student announcements:", err);
      }
    };

    fetchStudentProfile();
    fetchAssignments();
    fetchAnnouncements();
    setIsLoaded(true);
  }, [router, users]);

  useEffect(() => {
    const fetchStudentPayments = async () => {
      try {
        if (!currentUser?.email) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) {
          console.error("NEXT_PUBLIC_API_URL is missing in frontend/.env.local");
          return;
        }

        const response = await fetch(
          `${API_URL}/payments/student/${encodeURIComponent(currentUser.email)}`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(data.message || "Failed to fetch student payments");
          return;
        }

        setStudentDbPayments(data);
      } catch (error) {
        console.error("Student payment fetch error:", error);
      }
    };

    fetchStudentPayments();
  }, [currentUser]);

  const matchedStudent =
    students.find((s: any) => s.email === currentUser?.email) || null;

  const studentData = {
    name:
      dbStudentProfile?.name ||
      matchedStudent?.name ||
      currentUser?.name ||
      safeLocalStorage("userName") ||
      "Student User",

    email:
      dbStudentProfile?.email ||
      matchedStudent?.email ||
      currentUser?.email ||
      safeLocalStorage("userEmail") ||
      "Not available",

    phone:
      dbStudentProfile?.phoneNumber ||
      dbStudentProfile?.phone ||
      matchedStudent?.phoneNumber ||
      matchedStudent?.phone ||
      currentUser?.phoneNumber ||
      currentUser?.phone ||
      "Not available",

    batch:
      dbStudentProfile?.batchId ||
      dbStudentProfile?.batch ||
      matchedStudent?.batchId ||
      matchedStudent?.batch ||
      currentUser?.batchId ||
      currentUser?.batch ||
      "Not available",

    courseDuration: Number(
      dbStudentProfile?.courseDuration ||
        matchedStudent?.courseDuration ||
        currentUser?.courseDuration ||
        1
    ),

    status:
      dbStudentProfile?.status ||
      matchedStudent?.status ||
      currentUser?.status ||
      "Active",
  };

  const courseDurationText = `${studentData.courseDuration} ${
    studentData.courseDuration === 1 ? "Year" : "Years"
  } Program`;

  useEffect(() => {
    setProfileForm({
      name: studentData.name || "",
      phone: studentData.phone !== "Not available" ? studentData.phone : "",
    });
  }, [studentData.name, studentData.phone]);

  const paidYears = studentDbPayments
    .filter((p) => p.status === "Paid")
    .sort((a, b) => Number(b.academicYear) - Number(a.academicYear));

  const totalPaidYears = paidYears.length;

  const totalAmountPaid = paidYears.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const courseDuration = studentData.courseDuration;
  const outstandingYears = Math.max(0, courseDuration - totalPaidYears);
  const totalAssignments = studentAssignments.length;
  const totalAnnouncements = studentAnnouncements.length;

  const avatarSeed = encodeURIComponent(
    `${studentData.name}-${studentData.email}-${studentData.batch}`
  );

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
    setIsEditingProfile(false);
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      toast.error("No file attached to this assignment.");
      return;
    }

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "assignment_file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading ${fileName}...`);
  };

  if (!isLoaded || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <GraduationCap size={48} className="text-blue-200" />
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans text-gray-900 leading-normal">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen transition-all">
        <div className="p-8 border-b border-gray-100 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                My LMS
              </h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
                Student Area
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {[
            { id: "overview", icon: LayoutDashboard, label: "Overview" },
            { id: "assignments", icon: BookOpen, label: "Assignments" },
            { id: "announcements", icon: Bell, label: "Announcements" },
            { id: "payments", icon: CreditCard, label: "Payments" },
            { id: "profile", icon: UserIcon, label: "My Profile" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all group ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50"
                  : "text-gray-500 hover:bg-blue-50 hover:text-blue-600 font-semibold"
              }`}
            >
              <item.icon
                size={22}
                className={
                  activeTab === item.id
                    ? "text-white"
                    : "text-gray-400 group-hover:text-blue-600 transition-all group-hover:scale-110"
                }
              />
              <span className="text-base">{item.label}</span>

              {item.id === "announcements" &&
                studentAnnouncements.length > 0 &&
                activeTab !== "announcements" && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {studentAnnouncements.length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 mb-4 px-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-gray-400 font-bold hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut size={22} className="group-hover:scale-110 transition-all" />
            <span className="text-base">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 border-b border-gray-100 h-24 flex items-center justify-between px-10 sticky top-0 z-50 backdrop-blur-xl">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
              {activeTab}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
              <p className="text-sm text-gray-500 font-semibold">
                {studentData.batch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-100">
                  {courseDurationText}
                </span>
                <span className="text-base font-bold text-gray-900 leading-none">
                  {studentData.name}
                </span>
              </div>
              <span className="text-xs font-bold text-blue-500 mt-1.5 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                STUDENT
              </span>
            </div>

            <div
              onClick={() => setShowProfileCard(true)}
              className="relative group cursor-pointer active:scale-95 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-lg shadow-blue-200 ring-4 ring-white transition-all group-hover:rotate-3 group-hover:shadow-xl border border-blue-100">
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="bg-white p-7 rounded-[28px] shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group cursor-default">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Yearly Payment Progress
                    </h4>
                    <div className="flex items-baseline gap-3 mt-2">
                      <p className="text-3xl font-black text-gray-900">
                        {totalPaidYears} / {courseDuration}
                      </p>
                      <p className="text-xs font-bold text-gray-400">
                        Academic years paid
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-7 rounded-[28px] shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group cursor-default">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Total Amount Paid
                    </h4>
                    <div className="flex items-baseline gap-3 mt-2">
                      <p className="text-3xl font-black text-gray-900">
                        {totalAmountPaid}
                      </p>
                      <p className="text-xs font-bold text-gray-400">
                        Accumulated dues
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-7 rounded-[28px] shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group cursor-default">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
                      outstandingYears === 0
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Remaining Years
                    </h4>
                    <div className="flex items-baseline gap-3 mt-2">
                      <p
                        className={`text-3xl font-black ${
                          outstandingYears === 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {outstandingYears}
                      </p>
                      <p className="text-xs font-bold text-gray-400">
                        Outstanding duration
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignments */}
          {activeTab === "assignments" && (
            <div className="space-y-6">
              <div className="flex flex-col border-b border-gray-100 pb-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Academic Resources
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Access and download your course assignments.
                </p>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                        Resource Title
                      </th>
                      <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                        Release Date
                      </th>
                      <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentAssignments.map((a, i) => (
                      <tr
                        key={i}
                        className="hover:bg-blue-50/30 transition-all group"
                      >
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100 shadow-sm">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h5 className="text-lg font-bold text-gray-900 tracking-tight">
                                {a.title}
                              </h5>
                              <p className="text-sm text-gray-500 mt-1 font-medium line-clamp-1 max-w-md">
                                {a.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <span className="text-gray-900 font-bold bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                            {a.dueDate}
                          </span>
                        </td>
                        <td className="px-8 py-8 text-right">
                          {a.fileUrl ? (
                            <button
                              onClick={() =>
                                handleDownload(a.fileUrl!, a.fileName!)
                              }
                              className="flex items-center gap-2 ml-auto text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-sm font-black transition-all"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          ) : (
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg">
                              No file
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {studentAssignments.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-10 py-20 text-center text-gray-300 font-bold uppercase tracking-[0.2em]"
                        >
                          No assignments available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Announcements */}
          {activeTab === "announcements" && (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="flex flex-col border-b border-gray-100 pb-6">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight text-center">
                  News & Announcements
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium text-center">
                  Stay updated with the latest alerts from your instructors and
                  the institution.
                </p>
              </div>

              <div className="grid gap-6">
                {studentAnnouncements.map((ann, i) => (
                  <div
                    key={i}
                    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-md relative overflow-hidden group hover:shadow-xl transition-all"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-2 ${
                        ann.batch === "All Batches"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                            ann.batch === "All Batches"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <Megaphone size={24} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            {ann.date}
                          </p>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              ann.batch === "All Batches"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {ann.batch}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors tracking-tight">
                      {ann.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-lg font-medium">
                      {ann.content}
                    </p>
                  </div>
                ))}

                {studentAnnouncements.length === 0 && (
                  <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-md text-center text-gray-300 font-bold uppercase tracking-[0.2em]">
                    No announcements available.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div className="space-y-10">
              <div className="flex flex-col border-b border-gray-100 pb-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Yearly Payment Tracking
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Detailed tracking of your academic dues by year.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Paid Years
                  </p>
                  <p className="text-4xl font-black text-gray-900">
                    {totalPaidYears} / {courseDuration}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] shadow-2xl shadow-blue-200">
                  <p className="text-[11px] font-black text-blue-100 uppercase tracking-widest mb-4">
                    Total Amount Paid
                  </p>
                  <p className="text-4xl font-black text-white">
                    {totalAmountPaid}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Outstanding Years
                  </p>
                  <p className="text-4xl font-black text-red-500">
                    {outstandingYears}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="px-10 py-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                      <Calendar size={20} />
                    </div>
                    Academic Year | Amount | Status
                  </h4>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-white border-b border-gray-100">
                    <tr>
                      <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Academic Year
                      </th>
                      <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                        Amount
                      </th>
                      <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                        Payment Date
                      </th>
                      <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-base">
                    {paidYears.map((p, i) => (
                      <tr
                        key={p.id || i}
                        className="hover:bg-blue-50/20 transition-all group"
                      >
                        <td className="px-10 py-7 text-gray-900 font-black text-xl tracking-tighter">
                          {p.academicYear}
                        </td>
                        <td className="px-10 py-7 text-gray-900 font-black text-center">
                          {p.amount}
                        </td>
                        <td className="px-10 py-7 text-gray-400 font-bold text-sm text-center">
                          {new Date(p.paidDate).toLocaleDateString()}
                        </td>
                        <td className="px-10 py-7 text-right">
                          <span className="px-5 py-2 rounded-2xl text-[11px] font-black inline-flex items-center gap-2 shadow-sm uppercase tracking-widest bg-green-50 text-green-600 ring-1 ring-green-200">
                            <div className="w-2 h-2 rounded-full bg-green-600" />
                            Paid
                          </span>
                        </td>
                      </tr>
                    ))}

                    {paidYears.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-10 py-20 text-center text-gray-300 font-bold uppercase tracking-[0.2em]"
                        >
                          No payment records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Full Profile */}
          {activeTab === "profile" && (
            <div className="max-w-3xl mx-auto space-y-10">
              <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    My Profile
                  </h1>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Manage your personal information
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className={`relative z-10 flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-lg ${
                    isEditingProfile
                      ? "bg-gray-100 text-gray-700 shadow-none"
                      : "bg-blue-600 text-white shadow-blue-200"
                  }`}
                >
                  {isEditingProfile ? <X size={18} /> : <Edit2 size={18} />}
                  {isEditingProfile ? "Discard" : "Update Profile"}
                </button>
              </div>

              <div className="bg-white p-10 rounded-[24px] border border-gray-100 shadow-md relative overflow-hidden group">
                <div className="flex flex-col sm:flex-row items-center gap-8 border-b border-gray-100 pb-10 mb-10">
                  <div className="w-24 h-24 rounded-[28px] overflow-hidden border border-blue-100 shadow-lg bg-white">
                    <img
                      src={avatarUrl}
                      alt="Student Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-3xl font-bold text-gray-900 leading-none tracking-tight">
                      {profileForm.name || studentData.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="text-blue-600 font-black uppercase tracking-widest text-[11px] bg-blue-50 px-3 py-1 rounded-md">
                        {studentData.batch}
                      </span>
                      <span className="text-gray-500 font-medium uppercase tracking-widest text-xs">
                        STUDENT
                      </span>
                      <span className="text-green-600 font-black uppercase tracking-widest text-[11px] bg-green-50 px-3 py-1 rounded-md">
                        {studentData.status}
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        disabled={!isEditingProfile}
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium focus:bg-white focus:border-blue-500 transition-all outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        disabled={!isEditingProfile}
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium focus:bg-white focus:border-blue-500 transition-all outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        Email
                      </label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium cursor-not-allowed opacity-75">
                        {studentData.email}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        Batch
                      </label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium cursor-not-allowed opacity-75">
                        {studentData.batch}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        Course Duration
                      </label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium cursor-not-allowed opacity-75">
                        {courseDurationText}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        Status
                      </label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium cursor-not-allowed opacity-75">
                        {studentData.status}
                      </div>
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="pt-6 animate-in slide-in-from-bottom-4 duration-300">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
                      >
                        <Save size={18} /> Save Profile
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Profile Popup */}
      {showProfileCard && (
        <div
          className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileCard(false);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden max-h-[88vh] overflow-y-auto">
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-8 pt-10 pb-8 text-white">
              <button
                onClick={() => setShowProfileCard(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-24 h-24 rounded-[28px] overflow-hidden bg-white shadow-xl ring-4 ring-white/30 mb-5 border border-white/30">
                  <img
                    src={avatarUrl}
                    alt="Student Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-2xl font-black leading-tight">
                  {studentData.name}
                </h2>

                <p className="text-blue-100 text-sm font-semibold mt-1 break-all">
                  {studentData.email}
                </p>

                <span className="mt-4 px-4 py-1.5 rounded-full bg-white/15 text-white text-[10px] font-black uppercase tracking-widest">
                  Student
                </span>
              </div>
            </div>

            <div className="p-7 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <UserIcon size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Full Name
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {studentData.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <Mail size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Email
                    </p>
                    <p className="text-sm font-bold text-gray-900 break-all">
                      {studentData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <Phone size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Phone
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {studentData.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <GraduationCap
                    size={18}
                    className="text-blue-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Batch
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {studentData.batch}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <Clock size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Course Duration
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {courseDurationText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-blue-50 text-center">
                  <p className="text-lg font-black text-blue-600">
                    {totalPaidYears}
                  </p>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                    Paid
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-green-50 text-center">
                  <p className="text-lg font-black text-green-600">
                    {totalAssignments}
                  </p>
                  <p className="text-[9px] font-black text-green-400 uppercase tracking-widest">
                    Tasks
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-red-50 text-center">
                  <p className="text-lg font-black text-red-500">
                    {outstandingYears}
                  </p>
                  <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                    Due
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfileCard(false);
                  setActiveTab("profile");
                }}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
              >
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}