import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function wipeDatabase() {
  console.log("=== STARTING FULL DATABASE WIPE & RESET ===");

  // 1. Storage bucket cleanup
  try {
    const { data: files } = await supabase.storage.from("listing-images").list();
    if (files && files.length > 0) {
      const paths = files.map((f) => f.name);
      await supabase.storage.from("listing-images").remove(paths);
      console.log(`[Storage] Removed ${paths.length} uploaded image files.`);
    } else {
      console.log("[Storage] No files found in listing-images bucket.");
    }
  } catch (err) {
    console.warn("[Storage] Warning cleaning storage:", err);
  }

  // 2. Child tables first (foreign keys)
  const tables = [
    "reports",
    "notifications",
    "favorites",
    "messages",
    "conversations",
    "bids",
    "purchase_requests",
    "listing_images",
    "listings",
    "profiles",
  ];

  for (const table of tables) {
    try {
      const { error, count } = await supabase
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // neq dummy to delete all rows

      if (error) {
        // Fallback for tables without 'id' (e.g. favorites)
        const { error: err2 } = await supabase.from(table).delete().gt("created_at", "1970-01-01T00:00:00Z");
        if (err2) {
          console.error(`[DB] Error deleting from ${table}:`, err2.message);
        } else {
          console.log(`[DB] Wiped table: ${table}`);
        }
      } else {
        console.log(`[DB] Wiped table: ${table}`);
      }
    } catch (e: any) {
      console.error(`[DB] Exception deleting from ${table}:`, e.message);
    }
  }

  // 3. Delete all Supabase Auth Users
  try {
    const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) {
      console.error("[Auth] Error listing users:", listErr.message);
    } else if (usersData?.users && usersData.users.length > 0) {
      console.log(`[Auth] Deleting ${usersData.users.length} auth user(s)...`);
      for (const u of usersData.users) {
        const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
        if (delErr) {
          console.error(`[Auth] Failed to delete user ${u.email} (${u.id}):`, delErr.message);
        } else {
          console.log(`[Auth] Deleted user: ${u.email}`);
        }
      }
    } else {
      console.log("[Auth] No auth users found.");
    }
  } catch (authErr: any) {
    console.error("[Auth] Exception deleting users:", authErr.message);
  }

  // 4. Verify everything is 0
  console.log("\n=== VERIFYING FINAL COUNTS ===");
  const { data: finalUsers } = await supabase.auth.admin.listUsers();
  console.log(`Auth users remaining: ${finalUsers?.users?.length || 0}`);

  const { count: finalProfiles } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  console.log(`Profiles remaining: ${finalProfiles || 0}`);

  const { count: finalListings } = await supabase.from("listings").select("*", { count: "exact", head: true });
  console.log(`Listings remaining: ${finalListings || 0}`);

  console.log("=== FULL WIPE COMPLETED SUCCESSFULLY ===");
}

wipeDatabase().catch(console.error);
