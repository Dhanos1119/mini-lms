import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';

export interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

export function Table({ columns, data, onView, onEdit, onDelete }: TableProps) {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="w-full text-left border-collapse min-w-max">
        <thead className="bg-gray-50/80 border-b border-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="py-4 px-6 text-base font-semibold text-gray-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            {(onView || onEdit || onDelete) && (
              <th className="py-4 px-6 text-base font-semibold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-blue-50/40 transition-colors duration-200 group">
              {columns.map((col) => (
                <td key={col.key} className="py-4 px-6 text-base text-gray-700">
                  {row[col.key]}
                </td>
              ))}
              {(onView || onEdit || onDelete) && (
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    {onView && (
                      <button onClick={() => onView(row)} title="View" className="text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all hover:scale-110 active:scale-95">
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(row)} title="Edit" className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all hover:scale-110 active:scale-95">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} title="Delete" className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all hover:scale-110 active:scale-95">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="py-8 text-center text-gray-500 text-base">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
