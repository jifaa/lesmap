"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Tags,
  Users,
  LogOut,
  Shield,
  Check,
  X,
  Loader2,
  MapPin,
  Eye,
  Trash2,
  Plus,
  Search,
  Building2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import type { CoursePlace, UserProfile, Category, Fasilitas } from "@/types/database";
import { StatusBadge } from "../components/StatusBadge";
import { StatCard } from "../components/StatCard";

export function AdminDashboardPage() {
  const { user, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<"dashboard" | "pending" | "places" | "categories" | "fasilitas" | "users">("dashboard");
  const [places, setPlaces] = useState<CoursePlace[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fasilitas, setFasilitas] = useState<Fasilitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newFasilitas, setNewFasilitas] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const fetchPlaces = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("course_places").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPlaces(data || []);
    } catch (error) {
      toast.error("Gagal memuat data");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchFasilitas = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("fasilitas").select("*").order("name");
      if (error) throw error;
      setFasilitas(data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchPlaces(), fetchUsers(), fetchCategories(), fetchFasilitas()]);
      setLoading(false);
    };
    void loadAll();
  }, [fetchPlaces, fetchUsers, fetchCategories, fetchFasilitas]);

  const stats = {
    total: places.length,
    pending: places.filter(p => p.status === "pending").length,
    approved: places.filter(p => p.status === "approved").length,
    totalUsers: users.length,
    totalAdmins: users.filter(u => u.role === "admin").length,
    totalCategories: categories.length,
    totalFasilitas: fasilitas.length,
  };

  const handleApprove = async (id: number) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("course_places").update({ status: "approved" }).eq("id", id);
      if (error) throw error;
      toast.success("Berhasil diapprove");
      fetchPlaces();
    } catch (error: any) { toast.error(error?.message || "Gagal"); }
    finally { setSubmitting(false); }
  };

  const handleReject = async (id: number) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("course_places").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
      toast.success("Berhasil direject");
      fetchPlaces();
    } catch (error: any) { toast.error(error?.message || "Gagal"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin?")) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("course_places").delete().eq("id", id);
      if (error) throw error;
      toast.success("Dihapus");
      fetchPlaces();
    } catch (error: any) { toast.error(error?.message || "Gagal"); }
    finally { setSubmitting(false); }
  };

  const handleAddCategory = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newCategory.trim()) {
      alert("Nama kategori tidak boleh kosong");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("categories").insert({ name: newCategory.trim() });
      if (error) throw error;
      toast.success("Ditambahkan");
      setNewCategory("");
      fetchCategories();
    } catch (error: any) { 
      const msg = error?.message || "Gagal";
      toast.error(msg);
    }
    finally { setSubmitting(false); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Yakin?")) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Dihapus");
      fetchCategories();
    } catch (error: any) { toast.error(error?.message || "Gagal"); }
  };

  const handleAddFasilitas = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newFasilitas.trim()) {
      alert("Nama fasilitas tidak boleh kosong");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("fasilitas").insert({ name: newFasilitas.trim() });
      if (error) throw error;
      toast.success("Ditambahkan");
      setNewFasilitas("");
      fetchFasilitas();
    } catch (error: any) { 
      const msg = error?.message || "Gagal";
      toast.error(msg); 
    }
    finally { setSubmitting(false); }
  };

  const handleDeleteFasilitas = async (id: number) => {
    if (!confirm("Yakin?")) return;
    try {
      const { error } = await supabase.from("fasilitas").delete().eq("id", id);
      if (error) throw error;
      toast.success("Dihapus");
      fetchFasilitas();
    } catch (error: any) { toast.error(error?.message || "Gagal"); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Yakin hapus user ini?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal hapus");
      toast.success("User dihapus");
      fetchUsers();
    } catch (error: any) { toast.error(error?.message || "Gagal hapus"); }
    finally { setSubmitting(false); }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update");
      toast.success("User diupdate");
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) { toast.error(error?.message || "Gagal update"); }
    finally { setSubmitting(false); }
  };

  const pendingPlaces = places.filter(p => p.status === "pending");
  const filteredPlaces = places.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));



  return (
    <div className="flex w-full min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col sticky top-0 h-screen text-slate-300 hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg"><Shield className="h-4 w-4 text-white" /></div>
            <span className="font-bold text-lg text-white">Admin Panel</span>
          </div>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "pending", label: "Verifikasi", icon: ShieldCheck, badge: stats.pending },
            { id: "places", label: "Tempat Les", icon: MapPin },
            { id: "categories", label: "Kategori", icon: Tags },
            { id: "fasilitas", label: "Fasilitas", icon: Building2 },
            { id: "users", label: "User", icon: Users },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === item.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
              <span className="flex items-center gap-3"><item.icon className="w-5 h-5" />{item.label}</span>
              {item.badge ? <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span> : null}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="block text-slate-400 hover:text-white mb-2 px-4 py-2 text-sm">Kembali</Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 text-slate-400 hover:text-red-400 px-4 py-3 rounded-xl"><LogOut className="w-5 h-5" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Administrator Dashboard</h1>
        <p className="text-slate-500 mb-8">Sistem manajemen LesMap Samarinda</p>

        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total" value={stats.total} />
              <StatCard title="Pending" value={stats.pending} colorClass="text-yellow-600" />
              <StatCard title="Approved" value={stats.approved} colorClass="text-green-600" />
              <StatCard title="User" value={stats.totalUsers} colorClass="text-blue-600" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="font-bold mb-4">Pending ({pendingPlaces.length})</h2>
                {pendingPlaces.length === 0 ? <p className="text-slate-500 text-sm">Tidak ada</p> :
                  pendingPlaces.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex justify-between p-3 bg-slate-50 rounded-lg mb-2">
                      <div><p className="font-medium">{p.name}</p><p className="text-xs text-slate-500">{p.category}</p></div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="font-bold mb-4">Stats</h2>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Admin</span><span className="font-bold text-purple-700">{stats.totalAdmins}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Kategori</span><span className="font-bold">{stats.totalCategories}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Fasilitas</span><span className="font-bold">{stats.totalFasilitas}</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "pending" && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b"><h2 className="font-bold">Verifikasi ({pendingPlaces.length})</h2></div>
            {pendingPlaces.length === 0 ? <div className="text-center py-12 text-slate-500">Semua sudah diverifikasi</div> :
              <div className="divide-y">
                {pendingPlaces.map((place) => (
                  <div key={place.id} className="p-6 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-bold">{place.name}</h3>
                      <p className="text-sm text-slate-500">{place.category} - {place.district}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleReject(place.id)} disabled={submitting} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-1 disabled:opacity-50"><X className="w-4 h-4" /> Reject</button>
                      <button onClick={() => handleApprove(place.id)} disabled={submitting} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-1 disabled:opacity-50"><Check className="w-4 h-4" /> Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {activeTab === "places" && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b flex justify-between">
              <h2 className="font-bold">Semua Tempat Les ({places.length})</h2>
              <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 bg-slate-50 border rounded-lg text-sm" />
            </div>
              <table className="w-full">
                <thead className="bg-slate-50 text-left text-xs uppercase"><tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y">
                  {filteredPlaces.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{p.name}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{p.category}</span></td>
                      <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Link href={`/detail/${p.id}`} className="p-2 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold mb-6">Kelola Kategori</h2>
            <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
              <input type="text" placeholder="Kategori baru..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border rounded-lg" />
              <button type="button" onClick={handleAddCategory} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Tambah</button>
            </form>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border">
                    <span>{cat.name}</span>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
          </div>
        )}

        {activeTab === "fasilitas" && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold mb-6">Kelola Fasilitas</h2>
            <form onSubmit={handleAddFasilitas} className="flex gap-3 mb-6">
              <input type="text" placeholder="Fasilitas baru..." value={newFasilitas} onChange={(e) => setNewFasilitas(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border rounded-lg" />
              <button type="button" onClick={handleAddFasilitas} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Tambah</button>
            </form>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fasilitas.map((fas) => (
                  <div key={fas.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border">
                    <span>{fas.name}</span>
                    <button onClick={() => handleDeleteFasilitas(fas.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b"><h2 className="font-bold">Daftar User ({users.filter(u => u.role === "user").length})</h2></div>
              {users.filter(u => u.role === "user").length === 0 ? <div className="p-6 text-slate-500 text-sm">Belum ada user.</div> : (
                <table className="w-full">
                  <thead className="bg-slate-50 text-left text-xs uppercase"><tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Email / Phone</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
                  <tbody className="divide-y">
                    {users.filter(u => u.role === "user").map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">{u.full_name || "-"}</td>
                        <td className="px-6 py-4 text-sm">{u.email}<br/><span className="text-slate-500">{u.phone || "-"}</span></td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">{u.role}</span></td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => setEditingUser(u)} disabled={submitting} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"><UserCheck className="w-4 h-4" /></button>
                          {u.id !== user?.id && <button onClick={() => handleDeleteUser(u.id)} disabled={submitting} className="text-red-600 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b"><h2 className="font-bold">Daftar Admin ({users.filter(u => u.role === "admin").length})</h2></div>
              {users.filter(u => u.role === "admin").length === 0 ? <div className="p-6 text-slate-500 text-sm">Belum ada admin lain.</div> : (
                <table className="w-full">
                  <thead className="bg-slate-50 text-left text-xs uppercase"><tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Email / Phone</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
                  <tbody className="divide-y">
                    {users.filter(u => u.role === "admin").map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">{u.full_name || "-"}</td>
                        <td className="px-6 py-4 text-sm">{u.email}<br/><span className="text-slate-500">{u.phone || "-"}</span></td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">{u.role}</span></td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => setEditingUser(u)} disabled={submitting} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"><UserCheck className="w-4 h-4" /></button>
                          {u.id !== user?.id && <button onClick={() => handleDeleteUser(u.id)} disabled={submitting} className="text-red-600 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Edit User</h2>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama</label>
                  <input type="text" required value={editingUser.full_name || ""} onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" required value={editingUser.email || ""} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                  <p className="text-xs text-slate-500 mt-1">Mengubah email akan disinkronkan ke Auth.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="text" value={editingUser.phone || ""} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as "user"|"admin"})} className="w-full border rounded-lg px-3 py-2">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
