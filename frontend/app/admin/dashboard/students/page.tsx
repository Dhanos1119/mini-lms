"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Table, Column } from "@/components/Table";
import {
  Search,
  Filter,
  X,
  AlertCircle,
  GraduationCap,
  User,
  Mail,
  Phone,
  BookOpen,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useData } from "@/contexts/DataContext";

const columns: Column[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "batch", label: "Batch" },
  { key: "courseDurationDisplay", label: "Course Duration" },
  { key: "status", label: "Status" },
];

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { students, setStudents } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // DB batches from Admin Batch Management
  const [dbBatches, setDbBatches] = useState<any[]>([]);

  // Modal States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [viewTab, setViewTab] = useState("info");

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone: "",
    batch: "",
    status: "Active",
    courseDuration: 4,
  });

  // Fetch real students from DB
  const fetchStudents = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      const mapped = data.map((s: any) => ({
        ...s,
        batch: s.batchId,
        phone: s.phoneNumber || "",
        joinedYear: new Date(s.createdAt).getFullYear(),
        totalPaid: 0,
      }));

      setStudents(mapped);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all batches from DB
  const fetchBatchesFromDb = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/batches`);
      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Failed to fetch batches");
        return;
      }

      setDbBatches(data);
    } catch (error) {
      console.error("Fetch batches error:", error);
    }
  };

  useEffect(() => {
    if (students.length > 0) {
      setIsLoading(false);
    } else {
      fetchStudents();
    }

    fetchBatchesFromDb();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Query Params
  useEffect(() => {
    if (searchParams?.get("action") === "add") {
      setShowAddForm(true);
    }
  }, [searchParams]);

  // ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditItem(null);
        setViewItem(null);
        setDeleteItem(null);

        if (showAddForm) {
          setShowAddForm(false);
          router.replace("/admin/dashboard/students");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddForm, router]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBatch = batchFilter ? student.batch === batchFilter : true;
    const matchesStatus = statusFilter ? student.status === statusFilter : true;

    return matchesSearch && matchesBatch && matchesStatus;
  });

  const formattedStudents = filteredStudents.map((s) => ({
    ...s,
    courseDurationDisplay: `${s.courseDuration || 0} ${
      Number(s.courseDuration) === 1 ? "Year" : "Years"
    }`,
  }));

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStudent.name || !newStudent.email || !newStudent.batch) {
      toast.error("Please fill required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/add-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newStudent.name,
            email: newStudent.email,
            batchId: newStudent.batch,
            courseDuration: newStudent.courseDuration,
            phoneNumber: newStudent.phone,
            status: newStudent.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to add student");
      }

      await fetchStudents();

      setShowAddForm(false);
      setNewStudent({
        name: "",
        email: "",
        phone: "",
        batch: "",
        status: "Active",
        courseDuration: 4,
      });

      toast.success(
        (t) => (
          <span>
            <b>Student added successfully!</b>
            <br />
            Temporary Password:{" "}
            <b className="text-blue-600 px-1 select-all">
              {data.tempPassword || data.user?.passwordRaw || "Check email"}
            </b>
            <br />
            {data.message}
          </span>
        ),
        { duration: 6000 }
      );

      router.replace("/admin/dashboard/students");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();

    setStudents(
      students.map((s) =>
        s.id === editItem.id
          ? {
              ...editItem,
              courseDuration: Number(editItem.courseDuration),
            }
          : s
      )
    );

    setEditItem(null);
    toast.success("Student updated successfully");
  };

  const confirmDelete = () => {
    if (!deleteItem) return;

    setStudents(students.filter((s) => s.id !== deleteItem.id));
    setDeleteItem(null);
    toast.success("Student deleted successfully");
  };

  const inputClass =
    "h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400";

  const labelClass =
    "block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2";

  return (
    <div className="animate-in fade-in duration-500 text-gray-900 font-sans">
      <div className="mb-2">
        <p className="text-base text-gray-500 font-medium">
          Manage and view all enrolled students with course-wise tracking.
        </p>
      </div>

      <PageHeader
        title="Students Repository"
        buttonText="Add Student"
        onButtonClick={() => {
          setShowAddForm(true);
          router.replace("/admin/dashboard/students?action=add");
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-auto transition-all"
            >
              <option value="">All Batches</option>

              {dbBatches.map((batch) => (
                <option key={batch.id} value={batch.name}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || batchFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setBatchFilter("");
                setStatusFilter("");
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
              title="Reset Filters"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 bg-gray-100 rounded-lg flex-1" />
                <div className="h-10 bg-gray-100 rounded-lg flex-1" />
                <div className="h-10 bg-gray-100 rounded-lg w-32" />
                <div className="h-10 bg-gray-100 rounded-lg w-24" />
                <div className="h-10 bg-gray-100 rounded-lg w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={formattedStudents}
          onView={(student) => {
            setViewItem(student);
            setViewTab("info");
          }}
          onEdit={(student) => setEditItem(student)}
          onDelete={(student) => setDeleteItem(student)}
        />
      )}

      {/* Add Student Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
              router.replace("/admin/dashboard/students");
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Add New Student
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enroll a new student to a batch
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAddForm(false);
                  router.replace("/admin/dashboard/students");
                }}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    <User size={16} className="text-blue-500" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. John Doe"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        name: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Mail size={16} className="text-blue-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        email: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Phone size={16} className="text-blue-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +94771234567"
                    value={newStudent.phone}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        phone: e.target.value,
                      })
                    }
                    className={inputClass}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <BookOpen size={16} className="text-blue-500" />
                    Select Batch *
                  </label>
                  <select
                    value={newStudent.batch}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        batch: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>
                      Select a batch
                    </option>

                    {dbBatches.map((batch) => (
                      <option key={batch.id} value={batch.name}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Course Duration *
                  </label>
                  <select
                    value={newStudent.courseDuration}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        courseDuration: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isSubmitting}
                  >
                    <option value={1}>1 Year</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={4}>4 Years</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Status
                  </label>
                  <select
                    value={newStudent.status}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        status: e.target.value,
                      })
                    }
                    className={inputClass}
                    disabled={isSubmitting}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowAddForm(false);
                    router.replace("/admin/dashboard/students");
                  }}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Add Student"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) =>
            e.target === e.currentTarget && setDeleteItem(null)
          }
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sans">
              Confirm Removal
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed font-sans">
              Are you sure you want to remove this student account? This will
              permanently delete their access and data.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all active:scale-95 font-sans"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95 font-sans"
              >
                Remove Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={(e) => e.target === e.currentTarget && setEditItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Modify Student Profile
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update existing student details
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditItem(null)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    <User size={16} className="text-blue-500" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={editItem.name}
                    onChange={(e) =>
                      setEditItem({ ...editItem, name: e.target.value })
                    }
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Mail size={16} className="text-blue-500" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={editItem.email}
                    className={`${inputClass} bg-gray-50 cursor-not-allowed`}
                    disabled
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Phone size={16} className="text-blue-500" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editItem.phone}
                    onChange={(e) =>
                      setEditItem({ ...editItem, phone: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <BookOpen size={16} className="text-blue-500" />
                    Batch
                  </label>
                  <select
                    value={editItem.batch}
                    onChange={(e) =>
                      setEditItem({ ...editItem, batch: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select a batch</option>

                    {dbBatches.map((batch) => (
                      <option key={batch.id} value={batch.name}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Duration
                  </label>
                  <select
                    value={editItem.courseDuration}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        courseDuration: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  >
                    <option value={1}>1 Year</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={4}>4 Years</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Status
                  </label>
                  <select
                    value={editItem.status}
                    onChange={(e) =>
                      setEditItem({ ...editItem, status: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all font-sans"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={(e) => e.target === e.currentTarget && setViewItem(null)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
                  {viewItem.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {viewItem.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {viewItem.status}
                    </span>
                    <span>&bull;</span>
                    <span>Student since {viewItem.joinedYear}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewItem(null)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex px-8 border-b border-gray-100 bg-white">
              <button
                onClick={() => setViewTab("info")}
                className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                  viewTab === "info"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                General Info
              </button>
              <button
                onClick={() => setViewTab("academic")}
                className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                  viewTab === "academic"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Academic Activity
              </button>
              <button
                onClick={() => setViewTab("financial")}
                className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                  viewTab === "financial"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Financial Status
              </button>
            </div>

            <div className="p-8 h-[400px] overflow-y-auto bg-gray-50/30">
              {viewTab === "info" && (
                <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-300">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Email Address
                    </label>
                    <div className="text-base font-bold text-gray-900 bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                      <Mail size={18} className="text-blue-500" />
                      {viewItem.email}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Phone Number
                    </label>
                    <div className="text-base font-bold text-gray-900 bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                      <Phone size={18} className="text-blue-500" />
                      {viewItem.phone || "Not provided"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Assigned Batch
                    </label>
                    <div className="text-base font-bold text-gray-900 bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                      <BookOpen size={18} className="text-blue-500" />
                      {viewItem.batch}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Course Duration
                    </label>
                    <div className="text-base font-bold text-gray-900 bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                      <Clock size={18} className="text-blue-500" />
                      {viewItem.courseDuration}{" "}
                      {Number(viewItem.courseDuration) === 1
                        ? "Year"
                        : "Years"}
                    </div>
                  </div>
                </div>
              )}

              {viewTab === "academic" && (
                <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                  <div className="p-12 text-center">
                    <GraduationCap
                      size={48}
                      className="mx-auto text-gray-200 mb-4"
                    />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                      No academic records found for this student.
                    </p>
                  </div>
                </div>
              )}

              {viewTab === "financial" && (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        Total Paid
                      </p>
                      <p className="text-2xl font-black text-gray-900">
                        Rs. {viewItem.totalPaid?.toLocaleString() || "0"}
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        Paid Status
                      </p>
                      <p className="text-2xl font-black text-blue-600">
                        Active
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        Last Payment
                      </p>
                      <p className="text-sm font-bold text-gray-500 mt-2">
                        No recent transactions
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewItem(null)}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-200"
              >
                Done Viewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="flex p-8 justify-center items-center text-gray-500">Loading student directory...</div>}>
      <StudentsContent />
    </Suspense>
  );
}