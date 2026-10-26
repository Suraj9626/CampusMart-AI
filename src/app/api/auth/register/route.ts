import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isValidStudentEmail } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, department, academicYear } = body;

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: "Please provide all required registration fields." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isValidStudentEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid student Gmail or college-issued email (.edu or .ac.in)." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Database service client is not available." },
        { status: 500 }
      );
    }

    // 1. Create or ensure user exists in Supabase Auth with email_confirm: true
    let userId: string;

    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName.trim(),
        department: department || "General Studies",
        academic_year: academicYear || "Freshman",
      },
    });

    if (createError) {
      // If user already exists in Auth, update their password and confirm email
      if (createError.message.toLowerCase().includes("already registered") || createError.message.toLowerCase().includes("already exists")) {
        const { data: usersData } = await admin.auth.admin.listUsers();
        const existing = usersData?.users.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existing) {
          userId = existing.id;
          await admin.auth.admin.updateUserById(userId, {
            password: password,
            email_confirm: true,
            user_metadata: {
              display_name: displayName.trim(),
              department: department || "General Studies",
              academic_year: academicYear || "Freshman",
            },
          });
        } else {
          return NextResponse.json({ success: false, error: createError.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ success: false, error: createError.message }, { status: 400 });
      }
    } else {
      userId = createData.user.id;
    }

    // 2. Insert or update the public.profiles record
    const profileRecord = {
      id: userId,
      display_name: displayName.trim(),
      college_email: cleanEmail,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
      department: department || "General Studies",
      academic_year: academicYear || "Freshman",
      role: "student",
      status: "active",
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await admin.from("profiles").upsert(profileRecord, { onConflict: "id" });
    if (profileError) {
      console.error("Profile upsert error in register:", profileError);
    }

    return NextResponse.json({
      success: true,
      message: "Student account created and auto-verified successfully!",
      user: profileRecord,
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
