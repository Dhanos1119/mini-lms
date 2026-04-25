"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Table, Column } from '@/components/Table';
import { Search, Filter, Plus, Bell, X, FileText, Layout, BookOpen, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useData } from '@/contexts/DataContext';

const columns: Column[] = [
  { key: 'title', label: 'Title' },
  { key: 'batch', label: 'Batch' },
  { key: 'description', label: 'Description' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'status', label: 'Status' },
];

function AssignmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    assignments, 
    setAssignments, 
    announcements, 
    setAnnouncements, 
    setShowAssignmentModal 
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementBatch, setAnnouncementBatch] = useState('All Batches');

  // Edit Modal State
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  useEffect(() => {
    if (searchParams?.get('action') === 'add') {
      setShowAssignmentModal(true);
      router.replace('/admin/dashboard/assignments');
    }
  }, [searchParams, setShowAssignmentModal, router]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter ? assignment.batch === batchFilter : true;
    return matchesSearch && matchesBatch;
  });

  const formattedAssignments = filteredAssignments.map(a => ({
    ...a,
    description: a.description.length > 40 ? a.description.substring(0, 40) + '...' : a.description
  }));

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    setAnnouncements([{ 
      id: Date.now(), 
      title: announcementTitle,
      content: announcementContent, 
      batch: announcementBatch, 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    }, ...announcements]);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setShowAnnouncementForm(false);
    toast.success("Announcement posted successfully!");
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    setAssignments(assignments.filter(a => a.id !== deleteItem.id));
    setDeleteItem(null);
    toast.success("Assignment deleted successfully");
  };

  const inputClass = "h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400";
  const textareaClass = "rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400 resize-none min-h-[100px]";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2";

  return (
    <div className="animate-in fade-in duration-500 space-y-6 text-gray-900 font-sans">
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assignments & Announcements</h1>
          <p className="text-base text-gray-500 font-medium mt-1">Create assignments and post global announcements.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 shadow-sm"
          >
            <Bell size={18} />
            Post Announcement
          </button>
          <button 
            onClick={() => setShowAssignmentModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 shadow-sm shadow-blue-500/20"
          >
            <Plus size={18} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Post Announcement Form */}
      {showAnnouncementForm && (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                  <Bell size={20} />
               </div>
               <h3 className="text-xl font-bold text-gray-900">Push New Announcement</h3>
            </div>
            <button onClick={() => setShowAnnouncementForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handlePostAnnouncement} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                  <label className={labelClass}>
                    <Layout size={16} className="text-blue-500" />
                    Target Batch
                  </label>
                  <select 
                    value={announcementBatch}
                    onChange={(e) => setAnnouncementBatch(e.target.value)}
                    className={inputClass}
                  >
                    <option value="All Batches">All Batches</option>
                    <option value="Batch A - React">Batch A - React</option>
                    <option value="Batch B - Node.js">Batch B - Node.js</option>
                    <option value="Batch C - UI/UX">Batch C - UI/UX</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className={labelClass}>
                    <FileText size={16} className="text-blue-500" />
                    Announcement Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Schedule Update" 
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className={inputClass}
                  />
               </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>
                <Layout size={16} className="text-blue-500" />
                Message Content
              </label>
              <textarea 
                placeholder="Write your announcement message here..." 
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                className={textareaClass}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setShowAnnouncementForm(false)}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-bold active:scale-95 transition-all"
              >
                Discard
              </button>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Post Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm">
            <Bell size={22} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Announcements Feed</h2>
        </div>
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div key={announcement.id} className="p-6 rounded-2xl border border-gray-50 bg-gray-50/20 hover:bg-white hover:shadow-md transition-all group flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-start gap-5">
                <div className="mt-1">
                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${
                     announcement.batch === 'All Batches' 
                       ? 'bg-purple-100 text-purple-600' 
                       : 'bg-blue-100 text-blue-600'
                   }`}>
                     {announcement.batch}
                   </span>
                </div>
                <div>
                   <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{announcement.title}</h4>
                   <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">{announcement.content}</p>
                </div>
              </div>
              <span className="text-xs font-black text-gray-400 whitespace-nowrap sm:ml-4 bg-white px-3 py-1 rounded-lg border border-gray-50">{announcement.date}</span>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-xs">No announcements at this time.</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search assignments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select 
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-auto transition-all"
          >
            <option value="">All Batches</option>
            <option value="Batch A - React">Batch A - React</option>
            <option value="Batch B - Node.js">Batch B - Node.js</option>
            <option value="Batch C - UI/UX">Batch C - UI/UX</option>
          </select>
        </div>
        {(searchQuery || batchFilter) && (
          <button 
            onClick={() => { setSearchQuery(''); setBatchFilter(''); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
            title="Reset Filters"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <Table 
        columns={columns} 
        data={formattedAssignments} 
        onEdit={(assignment) => setEditItem(assignment)}
        onDelete={(assignment) => setDeleteItem(assignment)}
      />

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setDeleteItem(null)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-gray-900 font-sans">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Assignment?</h3>
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">This will permanently remove the assignment resource for all enrolled students. This action cannot be reversed.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-100 transition-all active:scale-95">
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans text-gray-900">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <Layout size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Assignment</h2>
                  <p className="text-sm text-gray-500">Update resource parameters and deadlines</p>
                </div>
              </div>
              <button onClick={() => setEditItem(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setAssignments(assignments.map(a => a.id === editItem.id ? editItem : a));
              setEditItem(null);
              toast.success("Assignment updated successfully");
            }} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    <FileText size={16} className="text-blue-500" />
                    Assignment Title
                  </label>
                  <input type="text" value={editItem.title} onChange={e => setEditItem({...editItem, title: e.target.value})} className={inputClass} required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <BookOpen size={16} className="text-blue-500" />
                    Batch
                  </label>
                  <select value={editItem.batch} onChange={e => setEditItem({...editItem, batch: e.target.value})} className={inputClass}>
                    <option>Batch A - React</option>
                    <option>Batch B - Node.js</option>
                    <option>Batch C - UI/UX</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Due Date
                  </label>
                  <input type="date" value={editItem.dueDate} onChange={e => setEditItem({...editItem, dueDate: e.target.value})} className={inputClass} required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Status
                  </label>
                  <select value={editItem.status} onChange={e => setEditItem({...editItem, status: e.target.value})} className={inputClass}>
                    <option>Active</option>
                    <option>Upcoming</option>
                    <option>Grading</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className={labelClass}>
                    <Layout size={16} className="text-blue-500" />
                    Description
                  </label>
                  <textarea value={editItem.description} onChange={e => setEditItem({...editItem, description: e.target.value})} className={textareaClass} required />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setEditItem(null)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <Suspense fallback={<div className="flex p-8 justify-center items-center text-gray-500">Loading assignments directory...</div>}>
      <AssignmentsContent />
    </Suspense>
  );
}
