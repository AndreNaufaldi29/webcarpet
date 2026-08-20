"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiShield,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiMenu,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiCalendar,
  FiLock,
  FiUser,
  FiFilter,
  FiDatabase,
} from "react-icons/fi";

const INITIAL_USERS = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    email: "admin@abcarpet.com",
    phone: "0812-3456-7890",
    role: "Super Admin",
    status: "active",
    password: "admin123",
    joinDate: "2025-01-10",
    lastActive: "2 jam yang lalu",
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "budi.santoso@abcarpet.com",
    phone: "0819-8765-4321",
    role: "Manager",
    status: "active",
    password: "manager123",
    joinDate: "2024-11-20",
    lastActive: "1 hari yang lalu",
  },
  {
    id: 3,
    name: "Hendra Wijaya",
    email: "hendra.staff@abcarpet.com",
    phone: "0838-4455-6677",
    role: "Staff",
    status: "active",
    password: "staff123",
    joinDate: "2025-01-15",
    lastActive: "5 jam yang lalu",
  },
  {
    id: 4,
    name: "Siti Rahmawati",
    email: "siti.rahma@gmail.com",
    phone: "0857-1234-5678",
    role: "Pelanggan",
    status: "active",
    password: "user12345",
    joinDate: "2025-02-14",
    lastActive: "10 menit yang lalu",
  },
  {
    id: 5,
    name: "Dewi Lestari",
    email: "dewi.lestari@yahoo.com",
    phone: "0821-9988-7766",
    role: "Pelanggan",
    status: "pending",
    password: "dewi@secret",
    joinDate: "2025-03-01",
    lastActive: "Belum pernah",
  },
  {
    id: 6,
    name: "Rina Novita",
    email: "rina.novita@gmail.com",
    phone: "0878-1122-3344",
    role: "Pelanggan",
    status: "inactive",
    password: "rina12345",
    joinDate: "2024-12-05",
    lastActive: "3 minggu yang lalu",
  },
  {
    id: 7,
    name: "Rizky Pratama",
    email: "rizky.pratama@outlook.com",
    phone: "0813-5566-7788",
    role: "Pelanggan",
    status: "active",
    password: "rizky@123",
    joinDate: "2025-02-28",
    lastActive: "30 menit yang lalu",
  },
  {
    id: 8,
    name: "Maya Indah",
    email: "maya.indah@gmail.com",
    phone: "0852-6677-8899",
    role: "Pelanggan",
    status: "active",
    password: "maya@pass",
    joinDate: "2025-03-04",
    lastActive: "Baru saja",
  },
];

export default function AdminUserPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Password Visibility States
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showViewPassword, setShowViewPassword] = useState(false);

  // Database Sync State
  const [isSyncing, setIsSyncing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Pelanggan",
    status: "active",
    password: "",
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /* =========================================================
     PRISMA DATABASE FETCH & SYNC
  ========================================================= */
  const fetchUsers = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/users");
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const mappedUsers = result.data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "-",
          role: u.role || "Pelanggan",
          status: u.status || "active",
          password: u.password || "password123",
          joinDate: u.createdAt
            ? new Date(u.createdAt).toISOString().split("T")[0]
            : "2025-01-10",
          lastActive: "Baru saja",
        }));
        setUsers(mappedUsers);
        if (showNotification) {
          showToast("Data pengguna berhasil disinkronkan dengan Prisma!", "success");
        }
      } else if (result.success && Array.isArray(result.data) && result.data.length === 0) {
        // Auto-seed initial Prisma DB if empty
        await fetch("/api/sync", { method: "POST" });
        const retryRes = await fetch("/api/users");
        const retryResult = await retryRes.json();
        if (retryResult.success && retryResult.data?.length > 0) {
          const mappedUsers = retryResult.data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || "-",
            role: u.role || "Pelanggan",
            status: u.status || "active",
            password: u.password || "password123",
            joinDate: u.createdAt
              ? new Date(u.createdAt).toISOString().split("T")[0]
              : "2025-01-10",
            lastActive: "Baru saja",
          }));
          setUsers(mappedUsers);
          if (showNotification) {
            showToast("Database Prisma diinisialisasi & disinkronkan!", "success");
          }
        }
      }
    } catch (err) {
      console.warn("Sinkronisasi database Prisma gagal, menggunakan state lokal:", err);
      if (showNotification) {
        showToast("Koneksi database Prisma gagal, beralih ke data lokal.", "warning");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchUsers(false);
  }, []);

  /* =========================================================
     FILTERING & PAGINATION
  ========================================================= */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search);

      const matchRole =
        roleFilter === "all" ||
        u.role.toLowerCase() === roleFilter.toLowerCase();

      const matchStatus =
        statusFilter === "all" || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminUsers = users.filter((u) => u.role === "Admin" || u.role === "Manager" || u.role === "Super Admin").length;
  const newUsersThisMonth = users.filter((u) => u.joinDate?.startsWith("2025-03")).length + 3;

  /* =========================================================
     MODAL & CRUD HANDLERS
  ========================================================= */
  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Pelanggan",
      status: "active",
      password: "",
    });
    setShowAddPassword(false);
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast("Nama dan email wajib diisi!", "danger");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showToast("Password minimal 6 karakter!", "danger");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "-",
          role: formData.role,
          status: formData.status,
          password: formData.password || "password123",
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const u = result.data;
        const newUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "-",
          role: u.role || "Pelanggan",
          status: u.status || "active",
          password: u.password || formData.password || "password123",
          joinDate: u.createdAt
            ? new Date(u.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          lastActive: "Baru saja",
        };
        setUsers([newUser, ...users]);
        setIsAddModalOpen(false);
        showToast(`Pengguna ${newUser.name} berhasil disimpan ke Database!`, "success");
        return;
      } else {
        showToast(result.error || "Gagal menyimpan pengguna ke database.", "danger");
      }
    } catch (err) {
      console.error("API create user error:", err);
      showToast("Koneksi server database gagal saat menyimpan user.", "danger");
    }
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone === "-" ? "" : user.phone || "",
      role: user.role,
      status: user.status,
      password: "",
    });
    setShowOldPassword(false);
    setShowEditPassword(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast("Nama dan email wajib diisi!", "danger");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showToast("Password baru minimal 6 karakter!", "danger");
      return;
    }

    const updatePayload = {
      id: selectedUser.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "-",
      role: formData.role,
      status: formData.status,
      ...(formData.password ? { password: formData.password } : {}),
    };

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const u = result.data;
        setUsers(
          users.map((item) =>
            item.id === selectedUser.id
              ? {
                  ...item,
                  name: u.name,
                  email: u.email,
                  phone: u.phone || "-",
                  role: u.role || "Pelanggan",
                  status: u.status || "active",
                  password: u.password || (formData.password ? formData.password : item.password),
                }
              : item
          )
        );
        setIsEditModalOpen(false);
        showToast(
          formData.password
            ? `Data & password ${formData.name} berhasil diperbarui di database!`
            : `Data ${formData.name} berhasil diperbarui di database!`,
          "success"
        );
        return;
      } else {
        showToast(result.error || "Gagal memperbarui data pengguna di database.", "danger");
      }
    } catch (err) {
      console.error("API update user error:", err);
      showToast("Koneksi server database gagal saat memperbarui data.", "danger");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    setUsers(
      users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );

    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      });
    } catch (err) {
      console.warn("API toggle status error:", err);
    }

    showToast(
      `Status ${user.name} diubah menjadi ${
        newStatus === "active" ? "Aktif" : "Nonaktif"
      }`,
      newStatus === "active" ? "success" : "warning"
    );
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/users?id=${selectedUser.id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setUsers(users.filter((u) => u.id !== selectedUser.id));
        setIsDeleteModalOpen(false);
        showToast(`Pengguna ${selectedUser.name} telah dihapus dari database.`, "danger");
        return;
      } else {
        showToast(result.error || "Gagal menghapus pengguna dari database.", "danger");
      }
    } catch (err) {
      console.error("API delete user error:", err);
      showToast("Koneksi server database gagal saat menghapus.", "danger");
    }
  };

  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setShowViewPassword(false);
    setIsViewModalOpen(true);
  };

  return (
    <div className="admin-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className={`admin-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* UNIFIED ADMIN HEADER */}
        <AdminHeader
          title="Manajemen User"
          breadcrumb="ADMIN PANEL / PENGGUNA"
          setMobileOpen={setMobileOpen}
        />

        <div className="admin-content">
          <div className="admin-user-header">
            <div className="admin-user-title">
              <h1>Daftar Pengguna Website</h1>
              <p className="admin-user-subtitle">
                Kelola akun pengguna, hak akses role, dan status keaktifan user tersinkronisasi Prisma.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="admin-btn-secondary"
                onClick={() => fetchUsers(true)}
                disabled={isSyncing}
                title="Sinkronkan data pengguna dengan Database Prisma"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <FiRefreshCw className={isSyncing ? "spin-icon" : ""} />
                <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Prisma"}</span>
              </button>

              <button
                className="admin-btn-primary"
                onClick={handleOpenAddModal}
              >
                <FiPlus />
                <span>Tambah User Baru</span>
              </button>
            </div>
          </div>

          <section className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#e0e7ff", color: "#3730a3" }}>
                  <FiUsers />
                </div>
                <span className="stat-change">+8%</span>
              </div>
              <div className="stat-value">{totalUsers}</div>
              <div className="stat-title">Total Pengguna</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#dcfce7", color: "#166534" }}>
                  <FiUserCheck />
                </div>
                <span className="stat-change">Aktif</span>
              </div>
              <div className="stat-value">{activeUsers}</div>
              <div className="stat-title">User Aktif</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#f3e8ff", color: "#6b21a8" }}>
                  <FiShield />
                </div>
                <span className="stat-change">Staf</span>
              </div>
              <div className="stat-value">{adminUsers}</div>
              <div className="stat-title">Admin & Manager</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#fef3c7", color: "#92400e" }}>
                  <FiUserPlus />
                </div>
                <span className="stat-change">Bulan Ini</span>
              </div>
              <div className="stat-value">+{newUsersThisMonth}</div>
              <div className="stat-title">Pengguna Baru</div>
            </div>
          </section>

          <div className="admin-user-filter-bar">
            <div className="admin-filter-group">
              <div className="admin-search-input-wrapper">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, email, atau HP..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="admin-search-input"
                />
              </div>

              <select
                className="admin-select-filter"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="super admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="pelanggan">Pelanggan</option>
                <option value="staff">Staff</option>
              </select>

              <select
                className="admin-select-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="admin-filter-count">
              Menampilkan {filteredUsers.length} pengguna
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>Kontak HP</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Tgl Bergabung</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info-cell">
                            <div className={`user-avatar-circle ${user.role.toLowerCase().replace(/\s+/g, "-")}`}>
                              {user.name.charAt(0)}
                            </div>
                            <div className="user-details">
                              <span className="user-name-text">{user.name}</span>
                              <span className="user-email-text">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`badge-role ${user.role.toLowerCase().replace(/\s+/g, "-")}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status ${user.status}`}>
                            <span className="status-dot"></span>
                            {user.status === "active"
                              ? "Aktif"
                              : user.status === "inactive"
                              ? "Nonaktif"
                              : "Pending"}
                          </span>
                        </td>
                        <td>{user.joinDate}</td>
                        <td>
                          <div
                            className="action-buttons"
                            style={{ justifyContent: "flex-end" }}
                          >
                            <button
                              className="btn-action-icon view"
                              onClick={() => handleOpenViewModal(user)}
                              title="Lihat Detail Profil & Password"
                            >
                              <FiEye />
                            </button>

                            <button
                              className="btn-action-icon edit"
                              onClick={() => handleOpenEditModal(user)}
                              title="Edit Data & Password"
                            >
                              <FiEdit />
                            </button>

                            <button
                              className="btn-action-icon toggle"
                              onClick={() => handleToggleStatus(user)}
                              title="Ubah Status Aktif/Nonaktif"
                            >
                              <FiRefreshCw />
                            </button>

                            <button
                              className="btn-action-icon delete"
                              onClick={() => handleOpenDeleteModal(user)}
                              title="Hapus Pengguna"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        Tidak ada data pengguna yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="user-mobile-cards">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <div key={user.id} className="user-card-item">
                    <div className="user-card-header">
                      <div className="user-info-cell">
                        <div className={`user-avatar-circle ${user.role.toLowerCase().replace(/\s+/g, "-")}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="user-details">
                          <span className="user-name-text">{user.name}</span>
                          <span className="user-email-text">{user.email}</span>
                        </div>
                      </div>
                      <span className={`badge-status ${user.status}`}>
                        <span className="status-dot"></span>
                        {user.status === "active"
                          ? "Aktif"
                          : user.status === "inactive"
                          ? "Nonaktif"
                          : "Pending"}
                      </span>
                    </div>

                    <div className="user-card-body">
                      <div className="user-card-row">
                        <span>Telepon:</span>
                        <strong>{user.phone}</strong>
                      </div>
                      <div className="user-card-row">
                        <span>Role:</span>
                        <span className={`badge-role ${user.role.toLowerCase().replace(/\s+/g, "-")}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="user-card-row">
                        <span>Bergabung:</span>
                        <span>{user.joinDate}</span>
                      </div>
                    </div>

                    <div className="user-card-footer">
                      <button
                        className="btn-action-icon view"
                        onClick={() => handleOpenViewModal(user)}
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn-action-icon edit"
                        onClick={() => handleOpenEditModal(user)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn-action-icon toggle"
                        onClick={() => handleToggleStatus(user)}
                      >
                        <FiRefreshCw />
                      </button>
                      <button
                        className="btn-action-icon delete"
                        onClick={() => handleOpenDeleteModal(user)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  Tidak ada data pengguna.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <div className="admin-pagination-info">
                  Halaman {currentPage} dari {totalPages}
                </div>

                <div className="admin-pagination-actions">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="btn-action-icon"
                    style={{ opacity: currentPage === 1 ? 0.5 : 1, width: "36px", height: "36px" }}
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="btn-action-icon"
                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, width: "36px", height: "36px" }}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =========================================================
         MODAL: TAMBAH USER BARU
      ========================================================= */}
      {isAddModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>Tambah Pengguna Baru</h3>
              <button
                className="admin-modal-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nama Lengkap *</label>
                  <div className="admin-input-wrapper">
                    <FiUser />
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Email Address *</label>
                  <div className="admin-input-wrapper">
                    <FiMail />
                    <input
                      type="email"
                      placeholder="contoh@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Nomor Telepon / WhatsApp</label>
                  <div className="admin-input-wrapper">
                    <FiPhone />
                    <input
                      type="text"
                      placeholder="0812xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div>
                    <label>Role Pengguna</label>
                    <select
                      className="admin-select-filter"
                      style={{ width: "100%" }}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Pelanggan">Pelanggan</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>

                  <div>
                    <label>Status Akun</label>
                    <select
                      className="admin-select-filter"
                      style={{ width: "100%" }}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Aktif</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Password Awal</label>
                  <div className="admin-input-wrapper">
                    <FiLock />
                    <input
                      type={showAddPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="admin-password-toggle-btn"
                      title={showAddPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showAddPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="admin-btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="admin-btn-primary">
                  Simpan User ke Prisma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
         MODAL: EDIT DATA PENGGUNA (DENGAN TAMPILAN PASSWORD LAMA & BARU)
      ========================================================= */}
      {isEditModalOpen && selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>Edit Data Pengguna</h3>
              <button
                className="admin-modal-close"
                onClick={() => setIsEditModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nama Lengkap</label>
                  <div className="admin-input-wrapper">
                    <FiUser />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Email</label>
                  <div className="admin-input-wrapper">
                    <FiMail />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Telepon / WhatsApp</label>
                  <div className="admin-input-wrapper">
                    <FiPhone />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* TAMPILAN PASSWORD SAAT INI (LAMA) */}
                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ margin: 0 }}>Password Saat Ini (Lama)</label>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Tersimpan di Database</span>
                  </div>
                  <div className="admin-current-password-box">
                    <div className="admin-password-display">
                      <FiLock style={{ color: "#64748b" }} />
                      <span>{showOldPassword ? (selectedUser.password || "password123") : "••••••••"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="admin-password-toggle-btn"
                      style={{ position: "static" }}
                      title={showOldPassword ? "Sembunyikan password lama" : "Lihat password lama"}
                    >
                      {showOldPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* FORM GANTI PASSWORD BARU (OPSIONAL) */}
                <div className="admin-form-group">
                  <label>Ganti Password Baru (Opsional)</label>
                  <div className="admin-input-wrapper">
                    <FiLock />
                    <input
                      type={showEditPassword ? "text" : "password"}
                      placeholder="Masukkan password baru jika ingin mengubah"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="admin-password-toggle-btn"
                      title={showEditPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showEditPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <span className="admin-form-hint">
                    Biarkan kosong jika tetap ingin menggunakan password saat ini.
                  </span>
                </div>

                <div className="admin-form-row">
                  <div>
                    <label>Role</label>
                    <select
                      className="admin-select-filter"
                      style={{ width: "100%" }}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Pelanggan">Pelanggan</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>

                  <div>
                    <label>Status</label>
                    <select
                      className="admin-select-filter"
                      style={{ width: "100%" }}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Aktif</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="admin-btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="admin-btn-primary">
                  Perbarui Data & Simpan ke Prisma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
         MODAL: PROFIL & VIEW USER (DENGAN TAMPILAN PASSWORD)
      ========================================================= */}
      {isViewModalOpen && selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>Profil Pengguna</h3>
              <button
                className="admin-modal-close"
                onClick={() => setIsViewModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-view-header">
                <div
                  className={`user-avatar-circle ${selectedUser.role.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{ width: "60px", height: "60px", fontSize: "22px" }}
                >
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2>{selectedUser.name}</h2>
                  <span className={`badge-role ${selectedUser.role.toLowerCase().replace(/\s+/g, "-")}`}>{selectedUser.role}</span>
                </div>
              </div>

              <div className="admin-view-details">
                <div className="admin-view-item">
                  <FiMail style={{ color: "#2563eb", fontSize: "18px" }} />
                  <div>
                    <span>EMAIL ADDRESS</span>
                    <strong>{selectedUser.email}</strong>
                  </div>
                </div>

                <div className="admin-view-item">
                  <FiPhone style={{ color: "#10b981", fontSize: "18px" }} />
                  <div>
                    <span>NOMOR TELEPON / WA</span>
                    <strong>{selectedUser.phone}</strong>
                  </div>
                </div>

                <div className="admin-view-item">
                  <FiLock style={{ color: "#8b5cf6", fontSize: "18px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>PASSWORD AKUN</span>
                      <button
                        type="button"
                        onClick={() => setShowViewPassword(!showViewPassword)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#64748b",
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0
                        }}
                      >
                        {showViewPassword ? <FiEyeOff /> : <FiEye />}
                        <span>{showViewPassword ? "Sembunyikan" : "Lihat"}</span>
                      </button>
                    </div>
                    <strong>{showViewPassword ? (selectedUser.password || "password123") : "••••••••"}</strong>
                  </div>
                </div>

                <div className="admin-view-item">
                  <FiCalendar style={{ color: "#f59e0b", fontSize: "18px" }} />
                  <div>
                    <span>TANGGAL BERGABUNG</span>
                    <strong>{selectedUser.joinDate}</strong>
                  </div>
                </div>

                <div className="admin-view-item">
                  <FiUserCheck style={{ color: "#6366f1", fontSize: "18px" }} />
                  <div>
                    <span>AKTIVITAS TERAKHIR</span>
                    <strong>{selectedUser.lastActive}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-primary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
         MODAL: KONFIRMASI HAPUS
      ========================================================= */}
      {isDeleteModalOpen && selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-container" style={{ maxWidth: "420px" }}>
            <div className="admin-modal-header danger-header">
              <h3>Konfirmasi Hapus</h3>
              <button
                className="admin-modal-close"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="admin-modal-body" style={{ textAlign: "center", padding: "30px 24px" }}>
              <FiAlertCircle style={{ fontSize: "48px", color: "#ef4444", marginBottom: "12px" }} />
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                Hapus Akun {selectedUser.name}?
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Tindakan ini akan menghapus akun dari database Prisma secara permanen.
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="admin-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="admin-btn-danger"
              >
                Ya, Hapus dari Prisma
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" && <FiCheckCircle style={{ fontSize: "18px" }} />}
          {toast.type === "danger" && <FiAlertCircle style={{ fontSize: "18px" }} />}
          {toast.type === "warning" && <FiAlertCircle style={{ fontSize: "18px" }} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
