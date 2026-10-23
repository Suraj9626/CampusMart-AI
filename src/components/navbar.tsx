"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Search, 
  PlusCircle, 
  Bell, 
  Heart, 
  MessageSquare, 
  User, 
  LogOut, 
  Shield, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Gavel, 
  ChevronDown, 
  Layers, 
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { useTheme } from "@/lib/theme-provider";

export function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 dark:border-white/10 bg-white/75 dark:bg-[#07090e]/75 backdrop-blur-xl transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 dark:from-white dark:via-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
                  CampusMart
                </span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold tracking-wide hidden sm:block -mt-1 uppercase">
                Student Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-zinc-600 dark:text-zinc-300">
            <Link 
              href="/marketplace" 
              className="px-3.5 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 transition"
            >
              Marketplace
            </Link>
            <Link 
              href="/marketplace?sale_mode=auction" 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition"
            >
              <Gavel className="w-3.5 h-3.5 text-amber-500" />
              Auctions
            </Link>
            <Link 
              href="/safety" 
              className="px-3.5 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 transition"
            >
              Safety Rules
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbooks, laptops, bikes, dorm items..."
            className="w-full text-xs font-medium bg-zinc-100/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 px-4 py-2 pl-9 pr-12 rounded-2xl border border-zinc-200/80 dark:border-white/10 focus:outline-none focus:border-indigo-500/60 focus:bg-white dark:focus:bg-zinc-950 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400">
            /
          </span>
        </form>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2">
          {/* Sell Product Button */}
          <Link
            href="/listings/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-102 active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Sell Item</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Favorites Shortcut */}
          <Link
            href="/favorites"
            title="Saved Items"
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition relative"
          >
            <Heart className="w-4 h-4" />
          </Link>

          {/* Messages Shortcut */}
          <Link
            href="/messages"
            title="Messages"
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition relative"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              title="Notifications"
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-3 z-50">
                <div className="px-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <Link
                        key={n.id}
                        href={n.link || '/dashboard'}
                        onClick={() => {
                          markAsRead(n.id);
                          setShowNotifMenu(false);
                        }}
                        className={`block p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition ${
                          !n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</p>
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />}
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </Link>
                    ))
                  )}
                </div>

                <div className="px-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifMenu(false)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              >
                {/* Avatar with fallback */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-white text-xs font-bold">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  ) : (
                    user.display_name[0]
                  )}
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{user.display_name.split(' ')[0]}</p>
                  <p className="text-zinc-400 text-[10px] mt-0.5 capitalize">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden xl:block" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 text-sm">
                  <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.display_name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.college_email}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      {user.department} • {user.academic_year}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    >
                      <Layers className="w-4 h-4 text-indigo-500" />
                      Student Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      My Profile & Bio
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Moderation
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 transition"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full text-sm bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 pl-10 rounded-xl"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link 
              href="/marketplace" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Marketplace
            </Link>
            <Link 
              href="/marketplace?sale_mode=auction" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center gap-2"
            >
              <Gavel className="w-4 h-4 text-amber-500" /> Live Auctions
            </Link>
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              My Dashboard
            </Link>
            <Link 
              href="/safety" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Campus Safety Rules
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
