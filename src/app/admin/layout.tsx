import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute role="admin">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
