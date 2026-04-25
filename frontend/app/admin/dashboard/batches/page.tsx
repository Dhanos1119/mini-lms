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

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.name || !newBatch.startDate) {
      toast.error("Please fill required fields");
      return;
    }

    const batchToAdd: Batch = {
      id: Date.now(),
      name: newBatch.name!,
      instructor: newBatch.instructor || 'TBD',
      description: newBatch.description || '',
      startDate: newBatch.startDate!,
      endDate: newBatch.endDate || '',
      studentsCount: '0',
      schedule: newBatch.schedule || 'TBD'
    };

    setBatches([batchToAdd, ...batches]);
    setShowCreateModal(false);
    setNewBatch({ name: '', description: '', startDate: '', endDate: '', instructor: '', schedule: '' });
    toast.success("Batch created successfully");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setBatches(batches.map(b => b.id === editItem.id ? editItem : b));
    setEditItem(null);
    toast.success("Batch updated successfully");
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    setBatches(batches.filter(b => b.id !== deleteItem.id));
    setDeleteItem(null);
    toast.success("Batch deleted successfully");
  };

  return (
    <div className="animate-in fade-in duration-500">
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
            <div className="p-8 grid grid-cols-2 gap-8 text-base">
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
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewItem(null)} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Batch</h2>
                  <p className="text-sm text-gray-500">Plan a new course schedule</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                    <Layout size={18} className="text-blue-500" />
                    Batch Name *
                  </label>
                  <input type="text" autoFocus placeholder="e.g. Batch D - Python" value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                    <User size={18} className="text-blue-500" />
                    Instructor Name
                  </label>
                  <input type="text" placeholder="e.g. Dr. Sarah Wilson" value={newBatch.instructor} onChange={e => setNewBatch({...newBatch, instructor: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                    <Calendar size={18} className="text-blue-500" />
                    Start Date *
                  </label>
                  <input type="date" value={newBatch.startDate} onChange={e => setNewBatch({...newBatch, startDate: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                    <Calendar size={18} className="text-blue-500" />
                    End Date
                  </label>
                  <input type="date" value={newBatch.endDate} onChange={e => setNewBatch({...newBatch, endDate: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                    <Clock size={18} className="text-blue-500" />
                    Schedule
                  </label>
                  <input type="text" placeholder="e.g. Mon/Wed 6PM" value={newBatch.schedule} onChange={e => setNewBatch({...newBatch, schedule: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <FileText size={18} className="text-blue-500" />
                  Course Description
                </label>
                <textarea rows={3} placeholder="What will students learn in this batch?" value={newBatch.description || ''} onChange={e => setNewBatch({...newBatch, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"></textarea>
              </div>

              <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 text-base font-bold shadow-sm">Discard</button>
                <button type="submit" className="px-8 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 text-base font-bold shadow-lg shadow-blue-200">Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Batch</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Batch Name</label>
                <input type="text" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Instructor</label>
                <input type="text" value={editItem.instructor} onChange={e => setEditItem({...editItem, instructor: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={editItem.startDate} onChange={e => setEditItem({...editItem, startDate: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={editItem.endDate} onChange={e => setEditItem({...editItem, endDate: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={editItem.description} onChange={e => setEditItem({...editItem, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditItem(null)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 text-base font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 text-base font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setDeleteItem(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-base mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-5 py-2.5 text-base font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all hover:scale-105 active:scale-95">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-base font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all hover:scale-105 active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
