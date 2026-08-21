import "../styles/admin.css";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "Admin Panel | Rumah Indah Carpet",
  description: "Halaman Admin Rumah Indah Carpet",
};

export default function AdminLayout({ children }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}

