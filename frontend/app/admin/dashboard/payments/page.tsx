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
  CreditCard,
  User,
  Mail,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useData } from "@/contexts/DataContext";

const columns: Column[] = [
  { key: "studentName", label: "Student Name" },
  { key: "email", label: "Email" },
  { key: "batch", label: "Batch" },
  { key: "yearLabel", label: "Year" },
  { key: "amount", label: "Amount" },
  { key: "formattedDate", label: "Paid Date" },
  { key: "status", label: "Status" },
];

const academicYears = [
  { value: 1, label: "Year 1" },
  { value: 2, label: "Year 2" },
  { value: 3, label: "Year 3" },
  { value: 4, label: "Year 4" },
  { value: 5, label: "Year 5" },
];

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { payments, setPayments } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [dbBatches, setDbBatches] = useState<any[]>([]);
  const [dbStudents, setDbStudents] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [showAddForm, setShowAddForm] = useState(false);

  const [newPayment, setNewPayment] = useState<any>({
    studentName: "",
    email: "",
    batch: "",
    amount: "",
    year: 1,
    paidDate: today,
    status: "Paid",
  });

  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const inputClass =
    "h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400";

  const labelClass =
    "block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2";

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const mapPaymentFromDb = (p: any) => {
    const yearNumber = Number(p.academicYear ?? p.year ?? 1);

    return {
      ...p,
      id: p.id,
      studentName: p.studentName,
      email: p.email,
      batch: p.batch,
      year: yearNumber,
      academicYear: yearNumber,
      yearLabel: `Year ${yearNumber}`,
      amount: Number(p.amount),
      paidDate: p.paidDate,
      status: p.status || "Paid",
      formattedDate:
        p.status === "Paid" && p.paidDate
          ? new Date(p.paidDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-",
    };
  };

  const fetchPaymentsFromDb = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch payments");
      }

      const mapped = data.map(mapPaymentFromDb);
      setPayments(mapped);
    } catch (error: any) {
      console.error("Fetch payments error:", error);
      toast.error(error.message || "Failed to fetch payments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBatchesFromDb = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/batches`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch batches");
      }

      setDbBatches(data);
    } catch (error: any) {
      console.error("Fetch batches error:", error);
      toast.error(error.message || "Failed to fetch batches");
    }
  };

  const fetchStudentsFromDb = async () => {
    try {
      const token = getToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to fetch students");
      }

      const mapped = data.map((s: any) => ({
        ...s,
        batch: s.batchId,
        phone: s.phoneNumber || "",
      }));

      setDbStudents(mapped);
    } catch (error: any) {
      console.error("Fetch students error:", error);
    }
  };

  useEffect(() => {
    fetchPaymentsFromDb();
    fetchBatchesFromDb();
    fetchStudentsFromDb();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchParams?.get("action") === "add") {
      setShowAddForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditItem(null);
        setDeleteItem(null);

        if (showAddForm) {
          setShowAddForm(false);
          router.replace("/admin/dashboard/payments");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddForm, router]);

  const handleStudentSelect = (email: string) => {
    const selectedStudent = dbStudents.find((s) => s.email === email);

    if (!selectedStudent) {
      setNewPayment({
        ...newPayment,
        studentName: "",
        email: "",
        batch: "",
      });
      return;
    }

    setNewPayment({
      ...newPayment,
      studentName: selectedStudent.name,
      email: selectedStudent.email,
      batch: selectedStudent.batchId || selectedStudent.batch || "",
    });
  };

  const filteredPayments = payments.filter((payment: any) => {
    const paymentYear = Number(payment.academicYear ?? payment.year);

    const matchesSearch =
      payment.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBatch = batchFilter ? payment.batch === batchFilter : true;
    const matchesStatus = statusFilter ? payment.status === statusFilter : true;
    const matchesYear = yearFilter ? paymentYear.toString() === yearFilter : true;

    return matchesSearch && matchesBatch && matchesStatus && matchesYear;
  });

  const formattedPayments = filteredPayments.map((p: any) => mapPaymentFromDb(p));

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newPayment.studentName ||
      !newPayment.email ||
      !newPayment.amount ||
      !newPayment.batch ||
      !newPayment.year
    ) {
      toast.error("Please fill required fields.");
      return;
    }

    const isDuplicate = payments.some((p: any) => {
      const existingYear = Number(p.academicYear ?? p.year);
      return (
        p.email === newPayment.email &&
        existingYear === Number(newPayment.year)
      );
    });

    if (isDuplicate) {
      toast.error(
        `Already paid for Year ${newPayment.year}. Please edit the existing record instead.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: newPayment.studentName,
          email: newPayment.email,
          batch: newPayment.batch,
          academicYear: Number(newPayment.year),
          amount: Number(newPayment.amount),
          paidDate: newPayment.status === "Paid" ? newPayment.paidDate : today,
          status: newPayment.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to record payment");
      }

      await fetchPaymentsFromDb();

      toast.success("Payment recorded successfully");

      setShowAddForm(false);
      setNewPayment({
        studentName: "",
        email: "",
        batch: "",
        amount: "",
        year: 1,
        paidDate: today,
        status: "Paid",
      });

      router.replace("/admin/dashboard/payments");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editItem) return;

    if (
      !editItem.studentName ||
      !editItem.email ||
      !editItem.amount ||
      !editItem.batch ||
      !editItem.year
    ) {
      toast.error("Please fill required fields.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/${editItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName: editItem.studentName,
            email: editItem.email,
            batch: editItem.batch,
            academicYear: Number(editItem.year),
            amount: Number(editItem.amount),
            paidDate: editItem.status === "Paid" ? editItem.paidDate : today,
            status: editItem.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update payment");
      }

      await fetchPaymentsFromDb();

      setEditItem(null);
      toast.success("Payment record updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment");
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/${deleteItem.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete payment");
      }

      await fetchPaymentsFromDb();

      setDeleteItem(null);
      toast.success("Payment record deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 text-gray-900">
      <div className="mb-2">
        <p className="text-base text-gray-500 font-medium">
          Record and track student payments year-wise.
        </p>
      </div>

      <PageHeader
        title="Payment Tracking"
        buttonText="Record Payment"
        onButtonClick={() => {
          setShowAddForm(true);
          router.replace("/admin/dashboard/payments?action=add");
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
              placeholder="Search by name or email..."
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
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-auto transition-all"
            >
              <option value="">All Years</option>
              {academicYears.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-auto">
            <BookOpen
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

          {(searchQuery || batchFilter || statusFilter || yearFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setBatchFilter("");
                setStatusFilter("");
                setYearFilter("");
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
          data={formattedPayments}
          onEdit={(payment) => setEditItem(mapPaymentFromDb(payment))}
          onDelete={(payment) => setDeleteItem(payment)}
        />
      )}

      {/* Add Payment Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setShowAddForm(false);
              router.replace("/admin/dashboard/payments");
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Record New Payment
                  </h2>
                  <p className="text-sm text-gray-500">
                    Log a student payment transaction
                  </p>
                </div>
              </div>

              <button
                disabled={isSubmitting}
                onClick={() => {
                  setShowAddForm(false);
                  router.replace("/admin/dashboard/payments");
                }}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90 disabled:opacity-70"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className={labelClass}>
                    <User size={16} className="text-blue-500" />
                    Select Student *
                  </label>
                  <select
                    value={newPayment.email}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className={inputClass}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select a student</option>
                    {dbStudents.map((student) => (
                      <option key={student.id} value={student.email}>
                        {student.name} - {student.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <User size={16} className="text-blue-500" />
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={newPayment.studentName}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        studentName: e.target.value,
                      })
                    }
                    className={`${inputClass} bg-blue-50`}
                    placeholder="Student name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Mail size={16} className="text-blue-500" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newPayment.email}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        email: e.target.value,
                      })
                    }
                    className={`${inputClass} bg-blue-50`}
                    placeholder="Student email"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <BookOpen size={16} className="text-blue-500" />
                    Select Batch *
                  </label>
                  <select
                    value={newPayment.batch}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        batch: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isSubmitting}
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
                    <Calendar size={16} className="text-blue-500" />
                    Academic Year *
                  </label>
                  <select
                    value={newPayment.year}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        year: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isSubmitting}
                  >
                    {academicYears.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <CreditCard size={16} className="text-blue-500" />
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        amount: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="e.g. 10000"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={newPayment.paidDate}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        paidDate: e.target.value,
                      })
                    }
                    className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
                    required={newPayment.status === "Paid"}
                    disabled={newPayment.status === "Unpaid" || isSubmitting}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Payment Status
                  </label>
                  <select
                    value={newPayment.status}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        status: e.target.value,
                      })
                    }
                    className={inputClass}
                    disabled={isSubmitting}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowAddForm(false);
                    router.replace("/admin/dashboard/payments");
                  }}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all disabled:opacity-70"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Record Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={(e) =>
            e.target === e.currentTarget && !isUpdating && setEditItem(null)
          }
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Edit Payment Record
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update transaction details
                  </p>
                </div>
              </div>

              <button
                disabled={isUpdating}
                onClick={() => setEditItem(null)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90 disabled:opacity-70"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    <User size={16} className="text-blue-500" />
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={editItem.studentName}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        studentName: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isUpdating}
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
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        email: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Calendar size={16} className="text-blue-500" />
                    Academic Year
                  </label>
                  <select
                    value={editItem.year}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        year: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isUpdating}
                  >
                    {academicYears.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <BookOpen size={16} className="text-blue-500" />
                    Batch
                  </label>
                  <select
                    value={editItem.batch}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        batch: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isUpdating}
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
                    <CreditCard size={16} className="text-blue-500" />
                    Amount
                  </label>
                  <input
                    type="number"
                    value={editItem.amount}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        amount: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Paid Date
                  </label>
                  <input
                    type="date"
                    value={
                      editItem.paidDate
                        ? new Date(editItem.paidDate).toISOString().split("T")[0]
                        : today
                    }
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        paidDate: e.target.value,
                      })
                    }
                    className={inputClass}
                    disabled={editItem.status === "Unpaid" || isUpdating}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Status
                  </label>
                  <select
                    value={editItem.status}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        status: e.target.value,
                      })
                    }
                    className={inputClass}
                    disabled={isUpdating}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setEditItem(null)}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all disabled:opacity-70"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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
            e.target === e.currentTarget && !isDeleting && setDeleteItem(null)
          }
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200 font-sans">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed">
              Are you sure you want to delete this payment record? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteItem(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all active:scale-95 disabled:opacity-70"
              >
                Cancel
              </button>

              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex p-8 justify-center items-center text-gray-500">
          Loading payments directory...
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}