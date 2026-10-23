import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Read and parse .env.local manually
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
} catch (e) {
  console.warn("Could not read .env.local:", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const SEED_GMAIL_STUDENTS = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma24@gmail.com",
    department: "Computer Science & Engineering",
    academic_year: "Junior",
    bio: "CS Junior building distributed systems and campus open-source projects.",
  },
  {
    name: "Ananya Patel",
    email: "ananya.patel@gmail.com",
    department: "Data Science & AI",
    academic_year: "Sophomore",
    bio: "AI and machine learning researcher. Loves mechanical keyboards and data hackathons.",
  },
  {
    name: "Rohan Verma",
    email: "rohan.verma.campus@gmail.com",
    department: "Electrical & Computer Engineering",
    academic_year: "Senior",
    bio: "Robotics club president. Looking for used oscilloscope and microcontrollers.",
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy.student@gmail.com",
    department: "Biomedical Engineering",
    academic_year: "Freshman",
    bio: "Freshman pre-med & biotech student. Avid reader and cyclist.",
  },
  {
    name: "Vikram Aditya",
    email: "vikram.aditya.college@gmail.com",
    department: "Mechanical Engineering",
    academic_year: "Junior",
    bio: "Formula Student race car chassis designer. 3D printing enthusiast.",
  },
  {
    name: "Ishita Gupta",
    email: "ishita.gupta.campus@gmail.com",
    department: "Business & Economics",
    academic_year: "Sophomore",
    bio: "Finance and economics double major. Campus debate society lead.",
  },
  {
    name: "Kabir Mehta",
    email: "kabir.mehta2026@gmail.com",
    department: "Physics & Mathematics",
    academic_year: "Senior",
    bio: "Theoretical physics senior. Selling dorm textbooks and scientific calculators.",
  },
  {
    name: "Diya Nair",
    email: "diya.nair.student@gmail.com",
    department: "Architecture & Design",
    academic_year: "Junior",
    bio: "Sustainable campus architecture researcher. iPad and graphic tablet artist.",
  },
  {
    name: "Arjun Singh",
    email: "arjun.singh.tech@gmail.com",
    department: "Computer Science & Engineering",
    academic_year: "Graduate",
    bio: "Graduate student in cybersecurity. Downsizing lab gear before graduation.",
  },
  {
    name: "Tanvi Deshmukh",
    email: "tanvi.deshmukh26@gmail.com",
    department: "Psychology & Social Sciences",
    academic_year: "Freshman",
    bio: "Cognitive science freshman. Badminton player and student volunteer.",
  },
];

const DEFAULT_PASSWORD = "Password@123";

async function seedGmailStudents() {
  console.log("=================================================");
  console.log("🚀 SEEDING 10 EXAMPLE STUDENT GMAIL ACCOUNTS TO SUPABASE");
  console.log(`Target: ${supabaseUrl}`);
  console.log(`Common Password: ${DEFAULT_PASSWORD}`);
  console.log("=================================================\n");

  let seededCount = 0;

  for (let i = 0; i < SEED_GMAIL_STUDENTS.length; i++) {
    const student = SEED_GMAIL_STUDENTS[i];
    console.log(`[${i + 1}/10] Processing ${student.name} <${student.email}>...`);

    try {
      // 1. Check if user already exists in auth.users
      const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;

      const existingUser = userList.users.find(u => u.email?.toLowerCase() === student.email.toLowerCase());

      let userId = existingUser?.id;

      if (!existingUser) {
        // Create user in Supabase auth with pre-confirmed email
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: student.email,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            display_name: student.name,
            department: student.department,
            academic_year: student.academic_year,
          },
        });

        if (createError) {
          console.warn(`  ⚠️ Auth create notice: ${createError.message}`);
        } else {
          userId = newUser.user?.id;
          console.log(`  ✅ Auth user created with ID: ${userId}`);
        }
      } else {
        // Update password to ensure it matches Password@123
        await supabase.auth.admin.updateUserById(existingUser.id, {
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            display_name: student.name,
            department: student.department,
            academic_year: student.academic_year,
          },
        });
        console.log(`  ✅ Existing user verified & password updated to ${DEFAULT_PASSWORD}`);
      }

      // 2. Ensure profile exists in public.profiles table
      if (userId) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: userId,
          display_name: student.name,
          college_email: student.email,
          avatar_url: `https://images.unsplash.com/photo-${1530000000000 + i * 100000}?auto=format&fit=crop&w=250&q=80`,
          department: student.department,
          academic_year: student.academic_year,
          bio: student.bio,
          role: "student",
          status: "active",
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn(`  ⚠️ Profile upsert notice: ${profileError.message}`);
        } else {
          console.log(`  ✅ Profile saved to public.profiles table`);
        }
      }

      seededCount++;
    } catch (err: any) {
      console.error(`  ❌ Error seeding ${student.email}:`, err?.message || err);
    }
  }

  console.log("\n=================================================");
  console.log(`🎉 SUCCESS: ${seededCount}/10 STUDENT GMAIL ACCOUNTS SEEDED IN DATABASE!`);
  console.log("=================================================");
}

seedGmailStudents().catch(console.error);
