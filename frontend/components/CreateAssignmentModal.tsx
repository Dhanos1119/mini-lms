"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  File as FileIcon,
  Trash2,
  FileText,
  BookOpen,
  Clock,
  Layout,
  Loader2,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import toast from "react-hot-toast";

interface CreateAssignmentModalProps {
  onClose: () => void;
}

export function CreateAssignmentModal({ onClose }: CreateAssignmentModalProps) {
  const { refreshAssignments } = useData();

  const [formData, setFormData] = useState({
    title: "",
    batch: "",
    dueDate: "",
    description: "",
  });

  const [dbBatches, setDbBatches] = useState<any[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const fetchBatchesFromDb = async () => {
    if (!API_URL) {
      toast.error("API URL is missing");
      return;
    }

    setIsLoadingBatches(true);

    try {
      const res = await fetch(`${API_URL}/batches`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch batches");
      }

      setDbBatches(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Fetch batches error:", error);
      toast.error(error.message || "Failed to fetch batches");
      setDbBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  useEffect(() => {
    fetchBatchesFromDb();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.batch || !formData.description || !formData.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!API_URL) {
      toast.error("API URL is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          batchId: formData.batch,
          dueDate: formData.dueDate,
          fileUrl: file ? file.name : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to create assignment");
      }

      console.log("✅ Assignment created in DB:", data.assignment);
      console.log("📧 Email info:", data.emailInfo);

      await refreshAssignments();

      const emailInfo = data.emailInfo;

      if (emailInfo) {
        toast.success(
          `Assignment created. Emails sent: ${emailInfo.emailSuccessCount}/${emailInfo.totalStudents}`
        );
      } else {
        toast.success("Assignment created successfully!");
      }

      setFormData({
        title: "",
        batch: "",
        dueDate: "",
        description: "",
      });

      setFile(null);
      onClose();
    } catch (err: any) {
      console.error("❌ Assignment creation error:", err);
      toast.error(err.message || "Error creating assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400";

  const textareaClass =
    "rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400 resize-none min-h-[120px] disabled:bg-gray-50 disabled:text-gray-400";

  const labelClass =
    "block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
              <FileText size={24} />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Create New Assignment
              </h2>
              <p className="text-sm text-gray-500">
                Set tasks and deadlines for students
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90 disabled:opacity-60"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>
                  <Layout size={16} className="text-blue-500" />
                  Assignment Title *
                </label>

                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. React Final Project"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  className={inputClass}
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
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      batch: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                  disabled={isSubmitting || isLoadingBatches}
                >
                  <option value="">
                    {isLoadingBatches ? "Loading batches..." : "Select a batch"}
                  </option>

                  <option value="All Batches">All Batches</option>

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
                  Due Date *
                </label>

                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>
                <FileText size={16} className="text-blue-500" />
                Description *
              </label>

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Enter assignment instructions..."
                className={textareaClass}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              <Upload size={16} className="text-blue-500" />
              Upload Reference File
            </label>

            {!file ? (
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
                  isDragging
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-600 bg-gray-50/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);

                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-500">
                  Upload a file or drag and drop
                </span>

                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) =>
                    e.target.files?.[0] && setFile(e.target.files[0])
                  }
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border border-gray-200 bg-blue-50/50 rounded-lg animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-blue-600">
                    <FileIcon size={20} />
                  </div>

                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  disabled={isSubmitting}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all active:scale-95 disabled:opacity-60"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingBatches}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}