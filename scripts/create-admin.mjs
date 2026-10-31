// Creates (or finds) Jeff's login and makes it the site admin.
//
//   node scripts/create-admin.mjs jeff@gmail.com
//
// Uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local. If the user doesn't exist
// yet it is created with a strong random password, printed once. Pass ADMIN_PASSWORD=... to choose one.
// Safe to re-run: an existing user is reused and the admin row is upserted.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "..");
if (existsSync(path.join(root, ".env.local"))) {
  for (const line of readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
const email = process.argv[2]?.trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/create-admin.mjs jeff@example.com");
  process.exit(1);
}
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser(address) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === address);
    if (hit || data.users.length < 200) return hit ?? null;
  }
  return null;
}

let user = await findUser(email);
let password = null;
if (!user) {
  password = process.env.ADMIN_PASSWORD || randomBytes(12).toString("base64url");
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(`Could not create user: ${error.message}`);
  user = data.user;
  console.log(`✓ Created login for ${email}`);
} else {
  console.log(`✓ Found existing login for ${email}`);
}

const { error: adminErr } = await db.from("admins").upsert({ user_id: user.id });
if (adminErr) throw new Error(`Could not add admin (did you run supabase/setup.sql?): ${adminErr.message}`);
console.log("✓ Marked as site admin");

const { error: settingsErr } = await db.from("settings").update({ contact_email: email }).eq("id", 1).is("contact_email", null);
if (!settingsErr) console.log("✓ Contact email set (if it was empty)");

if (password) {
  console.log(`\nSign in at /admin/login with:\n  email:    ${email}\n  password: ${password}\n\nSave this password now; it is not shown again. It can be reset from the Supabase dashboard (Authentication > Users).`);
}
