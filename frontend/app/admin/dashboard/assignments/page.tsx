"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Table, Column } from '@/components/Table';
import { Search, Filter, Plus, Bell, X, Upload, File as FileIcon, Trash2 } from 'lucide-react';
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
  const { assignments, setAssignments, announcements, setAnnouncements } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementBatch, setAnnouncementBatch] = useState('All Batches');

  // Drag & Drop State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  useEffect(() => {
    if (searchParams?.get('action') === 'add') {
      setShowAssignmentForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditItem(null);
        setDeleteItem(null);
        if (showAssignmentForm) {
          setShowAssignmentForm(false);
          router.replace('/admin/dashboard/assignments');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAssignmentForm, router]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter ? assignment.batch === batchFilter : true;
    return matchesSearch && matchesBatch;
  });

  const formattedAssignments = filteredAssignments.map(a => ({
    ...a,
    description: a.description.length > 40 ? a.description.substring(0, 40) + '...' : a.description
  }));

  // File Upload Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Action Logic
  const handlePostAnnouncement = () => {
    if (!announcementText.trim()) return;
    setAnnouncements([{ 
      id: Date.now(), 
      text: announcementText, 
      batch: announcementBatch, 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    }, ...announcements]);
    setAnnouncementText('');
    setShowAnnouncementForm(false);
    toast.success("Announcement posted successfully!");
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    setAssignments(assignments.filter(a => a.id !== deleteItem.id));
    setDeleteItem(null);
    toast.success("Assignment deleted successfully");
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
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
            onClick={() => {
              setShowAssignmentForm(true);
              router.replace('/admin/dashboard/assignments?action=add');
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 shadow-sm shadow-blue-500/20"
          >
            <Plus size={18} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Post Announcement Form */}
      {showAnnouncementForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">New Announcement</h3>
            <button onClick={() => setShowAnnouncementForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={announcementBatch}
              onChange={(e) => setAnnouncementBatch(e.target.value)}
              className="px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full sm:w-48 appearance-none"
            >
              <option value="All Batches">All Batches</option>
              <option value="Batch A - React">Batch A - React</option>
              <option value="Batch B - Node.js">Batch B - Node.js</option>
              <option value="Batch C - UI/UX">Batch C - UI/UX</option>
            </select>
            <input 
              type="text" 
              placeholder="Write your announcement here..." 
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={handlePostAnnouncement}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-2.5 rounded-xl text-base font-medium transition-all duration-200 whitespace-nowrap"
            >
              Post Now
            </button>
          </div>
        </div>
      )}

      {/* Create Assignment Modal (Unified) */}
      {showAssignmentForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAssignmentForm(false);
            router.replace('/admin/dashboard/assignments');
          }
        }}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upload New Assignment</h3>
              <button onClick={() => {
                setShowAssignmentForm(false);
                router.replace('/admin/dashboard/assignments');
              }} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Assignment Title</label>
                  <input type="text" autoFocus className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="e.g., Final Physics Project" />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Select Batch</label>
                  <select className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all">
                    <option>Batch A - React</option>
                    <option>Batch B - Node.js</option>
                    <option>Batch C - UI/UX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={4} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Provide instructions..."></textarea>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Resource Files (Optional)</label>
                  
                  {/* Drag & Drop Area */}
                  {!file ? (
                    <div 
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="space-y-1 text-center">
                        <Upload className={`mx-auto h-8 w-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div className="flex text-base text-gray-600">
                          <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500">
                            Upload a file
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-sm text-gray-500">PDF, ZIP, DOCX up to 10MB</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                      />
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between p-4 border border-blue-200 bg-blue-50/50 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <FileIcon size={20} />
                        </div>
                        <span className="text-base font-medium text-gray-800 truncate">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => setFile(null)} 
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => {
                setShowAssignmentForm(false);
                router.replace('/admin/dashboard/assignments');
              }} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 text-base font-medium transition-all duration-200">Cancel</button>
              <button 
                onClick={() => {
                  toast.success("Assignment Published Successfully!");
                  setShowAssignmentForm(false);
                  setFile(null);
                  router.replace('/admin/dashboard/assignments');
                }} 
                className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 text-base font-medium transition-all duration-200"
              >
                Publish Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Assignment</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setAssignments(assignments.map(a => a.id === editItem.id ? editItem : a));
              setEditItem(null);
              toast.success("Assignment updated successfully");
            }} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={editItem.title} onChange={e => setEditItem({...editItem, title: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Batch</label>
                  <select value={editItem.batch} onChange={e => setEditItem({...editItem, batch: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                    <option>Batch A - React</option>
                    <option>Batch B - Node.js</option>
                    <option>Batch C - UI/UX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Status</label>
                  <select value={editItem.status} onChange={e => setEditItem({...editItem, status: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                    <option>Active</option>
                    <option>Upcoming</option>
                    <option>Grading</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={editItem.dueDate} onChange={e => setEditItem({...editItem, dueDate: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={editItem.description} onChange={e => setEditItem({...editItem, description: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required></textarea>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 text-base font-medium transition-all duration-200">Cancel</button>
                <button type="submit" className="px-4 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 text-base font-medium transition-all duration-200">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-blue-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Recent Announcements</h2>
        </div>
        <div className="space-y-3">
          {announcements.map(announcement => (
            <div key={announcement.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  announcement.batch === 'All Batches' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {announcement.batch}
                </span>
                <p className="text-base text-gray-800 leading-relaxed">{announcement.text}</p>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap sm:ml-4 font-medium">{announcement.date}</span>
            </div>
          ))}
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
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setDeleteItem(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-base mb-6">Are you sure you want to delete this assignment? This action cannot be undone.</p>
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

export default function AssignmentsPage() {
  return (
    <Suspense fallback={<div className="flex p-8 justify-center items-center text-gray-500">Loading assignments directory...</div>}>
      <AssignmentsContent />
    </Suspense>
  );
}
