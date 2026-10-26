import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Database admin client unavailable." }, { status: 500 });
    }

    const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ success: false, error: listError.message }, { status: 500 });
    }

    const user = usersData?.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found in authentication system." }, { status: 404 });
    }

    if (!user.email_confirmed_at) {
      const { error: confirmError } = await admin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

      if (confirmError) {
        return NextResponse.json({ success: false, error: confirmError.message }, { status: 500 });
      }
    }

    // Ensure profile exists in public.profiles
    const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single();
    if (!profile) {
      await admin.from("profiles").upsert({
        id: user.id,
        display_name: user.user_metadata?.display_name || cleanEmail.split("@")[0],
        college_email: cleanEmail,
        department: user.user_metadata?.department || "General Studies",
        academic_year: user.user_metadata?.academic_year || "Freshman",
        role: "student",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Student account confirmed and ready for instant sign-in.",
      userId: user.id,
    });
  } catch (err: any) {
    console.error("Auto-confirm error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
