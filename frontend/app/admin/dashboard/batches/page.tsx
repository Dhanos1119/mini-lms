"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Table, Column } from '@/components/Table';
import { Search, X, Plus, Calendar, User, FileText, Layout, Eye, Clock, Info } from 'lucide-react';
import toast from 'react-hot-toast';

import { useData, Batch } from '@/contexts/DataContext';

const columns: Column[] = [
  { key: 'name', label: 'Batch Name' },
  { key: 'instructor', label: 'Instructor' },
  { key: 'studentsCount', label: 'Students' },
  { key: 'formattedStartDate', label: 'Start Date' },
  { key: 'formattedEndDate', label: 'End Date' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'shortDescription', label: 'Description' },
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function BatchesPage() {
  const { batches, setBatches, students } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  
  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewItem, setViewItem] = useState<Batch | null>(null);
  const [editItem, setEditItem] = useState<Batch | null>(null);
  const [deleteItem, setDeleteItem] = useState<Batch | null>(null);

  const [newBatch, setNewBatch] = useState<Partial<Batch>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    instructor: '',
    schedule: ''
  });

  // Fetch batches from PostgreSQL database
  useEffect(() => {
    const fetchBatchesFromDb = async () => {
      try {
        const response = await fetch(`${API_URL}/batches`);
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "Failed to load batches");
          return;
        }

        setBatches(data);
      } catch (error) {
        console.error("Fetch batches error:", error);
        toast.error("Failed to connect to batch API");
      }
    };

    fetchBatchesFromDb();
  }, [API_URL, setBatches]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditItem(null);
        setDeleteItem(null);
        setShowCreateModal(false);
        setViewItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredBatches = batches.filter(batch => 
    batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Student Count & Formatting
  const batchesWithDynamicCounts = filteredBatches.map(batch => ({
    ...batch,
    studentsCount: students.filter(s => s.batch === batch.name).length.toString(),
    formattedStartDate: formatDate(batch.startDate),
    formattedEndDate: formatDate(batch.endDate),
    shortDescription: batch.description ? (
      <div className="max-w-[150px] truncate" title={batch.description}>
        {batch.description}
      </div>
    ) : "-"
  }));

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBatch.name || !newBatch.startDate) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newBatch.name,
          instructor: newBatch.instructor || "TBD",
          description: newBatch.description || "",
          startDate: newBatch.startDate,
          endDate: newBatch.endDate || "",
          schedule: newBatch.schedule || "TBD"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to create batch");
        return;
      }

      setBatches([data.batch, ...batches]);
      setShowCreateModal(false);
      setNewBatch({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        instructor: '',
        schedule: ''
      });

      toast.success("Batch created successfully");
    } catch (error) {
      console.error("Create batch error:", error);
      toast.error("Failed to connect to server");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editItem) return;

    try {
      const response = await fetch(`${API_URL}/batches/${editItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editItem.name,
          instructor: editItem.instructor || "TBD",
          description: editItem.description || "",
          startDate: editItem.startDate,
          endDate: editItem.endDate || "",
          schedule: editItem.schedule || "TBD"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update batch");
        return;
      }

      setBatches(batches.map(b => b.id === editItem.id ? data.batch : b));
      setEditItem(null);
      toast.success("Batch updated successfully");
    } catch (error) {
      console.error("Update batch error:", error);
      toast.error("Failed to connect to server");
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch(`${API_URL}/batches/${deleteItem.id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to delete batch");
        return;
      }

      setBatches(batches.filter(b => b.id !== deleteItem.id));
      setDeleteItem(null);
      toast.success("Batch deleted successfully");
    } catch (error) {
      console.error("Delete batch error:", error);
      toast.error("Failed to connect to server");
    }
  };

  const inputClass = "h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400";
  const textareaClass = "rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400 resize-none min-h-[100px]";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2";

  return (
    <div className="animate-in fade-in duration-500 text-gray-900 font-sans">
      <div className="mb-2">
        <p className="text-base text-gray-500 font-medium">Manage course batches and schedules.</p>
      </div>
      <PageHeader 
        title="Batch Management" 
        buttonText="Create Batch"
        onButtonClick={() => setShowCreateModal(true)}
      >
        <div className="relative w-full sm:w-64 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search batches or instructors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all"
            />
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 hover:bg-red-50 rounded-xl transition-colors active:scale-95">
              <X size={20} />
            </button>
          )}
        </div>
      </PageHeader>

      <Table 
        columns={columns} 
        data={batchesWithDynamicCounts} 
        onView={(batch) => setViewItem(batch)}
        onEdit={(batch) => setEditItem(batch)}
        onDelete={(batch) => setDeleteItem(batch)}
      />

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && setViewItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                  <Eye size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{viewItem.name}</h2>
                  <p className="text-sm text-gray-500">Full Batch Details</p>
                </div>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8 text-base text-gray-900">
              <div className="space-y-1">
                <p className="text-gray-500 font-medium">Instructor</p>
                <div className="flex items-center gap-2 text-gray-900 font-semibold p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <User size={18} className="text-blue-500" />
                  {viewItem.instructor}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 font-medium">Schedule</p>
                <div className="flex items-center gap-2 text-gray-900 font-semibold p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Clock size={18} className="text-blue-500" />
                  {viewItem.schedule}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 font-medium">Start Date</p>
                <div className="flex items-center gap-2 text-gray-900 font-semibold p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Calendar size={18} className="text-blue-500" />
                  {formatDate(viewItem.startDate)}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 font-medium">Target End Date</p>
                <div className="flex items-center gap-2 text-gray-900 font-semibold p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Calendar size={18} className="text-blue-500" />
                  {formatDate(viewItem.endDate)}
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-gray-500 font-medium">Description</p>
                <div className="flex items-start gap-2 text-gray-900 p-4 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed">
                  <Info size={18} className="text-blue-500 mt-1 flex-shrink-0" />
                  {viewItem.description || "No description provided."}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end font-sans">
              <button onClick={() => setViewItem(null)} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Batch Modal Container */}
      {(showCreateModal || editItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCreateModal(false);
            setEditItem(null);
          }
        }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  {showCreateModal ? <Plus size={24} /> : <Layout size={24} />}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{showCreateModal ? "Create New Batch" : "Edit Batch Details"}</h2>
                  <p className="text-sm text-gray-500">{showCreateModal ? "Plan a new course schedule" : "Modify existing batch parameters"}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowCreateModal(false); setEditItem(null); }}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreateBatch : handleSaveEdit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Layout size={16} className="text-blue-500" />
                    Batch Name *
                  </label>
                  <input 
                    type="text" 
                    autoFocus={showCreateModal}
                    placeholder="e.g. Batch/2026" 
                    value={showCreateModal ? newBatch.name : editItem?.name} 
                    onChange={e => showCreateModal ? setNewBatch({...newBatch, name: e.target.value}) : setEditItem({...editItem!, name: e.target.value})} 
                    className={inputClass} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <User size={16} className="text-blue-500" />
                    Instructor Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dr. Sarah Wilson" 
                    value={showCreateModal ? newBatch.instructor : editItem?.instructor} 
                    onChange={e => showCreateModal ? setNewBatch({...newBatch, instructor: e.target.value}) : setEditItem({...editItem!, instructor: e.target.value})} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Calendar size={16} className="text-blue-500" />
                    Start Date *
                  </label>
                  <input 
                    type="date" 
                    value={showCreateModal ? newBatch.startDate : editItem?.startDate} 
                    onChange={e => showCreateModal ? setNewBatch({...newBatch, startDate: e.target.value}) : setEditItem({...editItem!, startDate: e.target.value})} 
                    className={inputClass} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Calendar size={16} className="text-blue-500" />
                    End Date
                  </label>
                  <input 
                    type="date" 
                    value={showCreateModal ? newBatch.endDate : editItem?.endDate} 
                    onChange={e => showCreateModal ? setNewBatch({...newBatch, endDate: e.target.value}) : setEditItem({...editItem!, endDate: e.target.value})} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Schedule
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mon/Wed 6PM" 
                    value={showCreateModal ? newBatch.schedule : editItem?.schedule} 
                    onChange={e => showCreateModal ? setNewBatch({...newBatch, schedule: e.target.value}) : setEditItem({...editItem!, schedule: e.target.value})} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className={labelClass}>
                    <FileText size={16} className="text-blue-500" />
                    Course Description
                  </label>
                  <textarea 
                    placeholder="What will students learn in this batch?" 
                    value={showCreateModal ? newBatch.description || '' : editItem?.description || ''} 
                    onChange={e => showCreateModal ? setNewBatch({...newBatch, description: e.target.value}) : setEditItem({...editItem!, description: e.target.value})} 
                    className={textareaClass}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => { setShowCreateModal(false); setEditItem(null); }} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all">Discard</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all">{showCreateModal ? "Create Batch" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setDeleteItem(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200 font-sans text-gray-900">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-sm font-medium mb-6">Are you sure you want to delete this batch? This action cannot be undone and will affect student enrollment.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}