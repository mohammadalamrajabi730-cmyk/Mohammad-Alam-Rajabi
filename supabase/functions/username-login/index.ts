import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { username, password } = await req.json();
    if (typeof username !== "string" || typeof password !== "string" ||
        !/^[a-zA-Z0-9_.-]{3,32}$/.test(username) || password.length < 1 || password.length > 256) {
      return json({ error: "نام کاربری یا رمز عبور نادرست است." }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) {
      return json({ error: "تنظیمات ورود کامل نیست." }, 500);
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: mapping, error: lookupError } = await admin
      .from("username_login").select("auth_email").eq("username", username).maybeSingle();
    if (lookupError || !mapping?.auth_email) {
      return json({ error: "نام کاربری یا رمز عبور نادرست است." }, 401);
    }

    const auth = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await auth.auth.signInWithPassword({
      email: mapping.auth_email,
      password,
    });
    if (error || !data.session) {
      return json({ error: "نام کاربری یا رمز عبور نادرست است." }, 401);
    }
    return new Response(JSON.stringify({ session: data.session, user: data.user }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return json({ error: "درخواست نامعتبر است." }, 400);
  }
});

function json(body: Record<string, string>, status: number) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
