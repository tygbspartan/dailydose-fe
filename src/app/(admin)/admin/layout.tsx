import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminShell from "@/components/layout/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
