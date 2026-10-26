import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { parseSjcemStudentEmail } from "@/lib/constants";

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
    const cleanPassword = password.toString().trim();

    // 1. Strict SJCEM 125[name][4-digit]@sjcem.edu.in validation
    const sjcem = parseSjcemStudentEmail(cleanEmail);
    if (!sjcem.isValid || !sjcem.expectedPin) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Registration is restricted to college emails in the format 125[name][4-digit]@sjcem.edu.in (e.g. 125suraj6041@sjcem.edu.in)." 
        },
        { status: 400 }
      );
    }

    // 2. Strict 4-digit PIN matching validation
    if (cleanPassword !== sjcem.expectedPin) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Registration failed: Password must be the exact 4-digit number from your college email (${sjcem.expectedPin}).` 
        },
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

    // Internal password format to satisfy auth provider minimum length rules
    const authPassword = `sjcem_${cleanPassword}`;

    // 1. Create or ensure user exists in Supabase Auth with email_confirm: true
    let userId: string;

    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: authPassword,
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
            password: authPassword,
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
