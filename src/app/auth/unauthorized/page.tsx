"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft, Home, Search } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Akses Ditolak
        </h1>
        <p className="text-slate-600 mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
          <br />
          Halaman ini hanya untuk administrator.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            <Search className="w-4 h-4" />
            Cari Tempat Les
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke halaman sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}
