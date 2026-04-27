// src/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Menu } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              ⚡ IssueForge
            </Link>
            {session && (
              <div className="hidden md:flex space-x-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Issues
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Analytics
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="hidden md:block">
                  <span className="text-sm text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}