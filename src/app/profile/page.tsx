"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, ShieldCheck, Mail, GraduationCap, Building, Edit2, Check, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { COLLEGE_DEPARTMENTS, ACADEMIC_YEARS } from "@/lib/constants";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [department, setDepartment] = useState(user?.department || COLLEGE_DEPARTMENTS[0]);
  const [academicYear, setAcademicYear] = useState<any>(user?.academic_year || "Senior");
  const [bio, setBio] = useState(user?.bio || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold">Please log in to view your profile.</h2>
        <Link href="/auth/login" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      display_name: displayName,
      department,
      academic_year: academicYear,
      bio,
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/dashboard" className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span className="text-xs text-zinc-400">Campus Identity & Profile</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-lg space-y-8">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                user.display_name[0]
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {user.display_name}
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" /> {user.college_email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none"
                >
                  {COLLEGE_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value as any)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none"
                >
                  {ACADEMIC_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Student Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Share your major, extracurriculars, or general campus info..."
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Save Changes
            </button>
          </form>
        ) : (
          /* Profile Details View */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-1">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" /> Academic Department
              </span>
              <p className="font-semibold text-zinc-900 dark:text-white">{user.department}</p>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-1">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Academic Class
              </span>
              <p className="font-semibold text-zinc-900 dark:text-white">{user.academic_year}</p>
            </div>

            <div className="sm:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-1">
              <span className="text-xs text-zinc-400 font-medium">Bio</span>
              <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed italic">
                {user.bio ? `"${user.bio}"` : "No bio added yet."}
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
