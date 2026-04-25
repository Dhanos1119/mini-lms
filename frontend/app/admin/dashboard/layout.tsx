import React from 'react';
import { AdminLayout } from '@/components/Layout';
import { DataProvider } from '@/contexts/DataContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <AdminLayout>{children}</AdminLayout>
    </DataProvider>
  );
}
