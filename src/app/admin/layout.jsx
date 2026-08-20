import "../styles/admin.css";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "Admin Panel | AB Carpet",
  description: "Halaman Admin AB Carpet",
};

export default function AdminLayout({ children }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}

