"use client";

import Link from "next/link";
import { Compass, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-client";

export function Footer() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <div className="bg-blue-600 p-1 rounded">
              <Compass className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium text-slate-700">
              LesMap <span className="text-blue-600">Samarinda</span>
            </span>
            <span className="mx-2">·</span>
            <span>© 2024</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/search"
              className="text-slate-500 hover:text-blue-600 transition-colors"
            >
              Peta Kursus
            </Link>

            {/* Subtle Admin Link */}
            {!isAuthenticated && (
              <Link
                href="/auth/login?next=/admin"
                className="text-slate-400 hover:text-slate-600 transition-colors text-xs"
                title="Admin Login"
              >
                Login Admin
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium"
              >
                Dashboard Admin
              </Link>
            )}

            <div className="flex items-center gap-1 text-slate-400 text-xs">
              Dibuat dengan <Heart className="h-3 w-3 text-red-400 fill-current mx-0.5" /> di
              Samarinda
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
