import React from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
  children?: React.ReactNode; 
}

export function PageHeader({ title, buttonText, onButtonClick, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {children}
        {buttonText && (
          <button 
            onClick={onButtonClick}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-base font-medium transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus size={18} />
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
