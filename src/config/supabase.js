import { createClient } from "@supabase/supabase-js";

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

export const supabase = createClient(supabaseURL, supabaseKey);

export async function connectSupabase() {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    console.log("Supabase connected ❤️");
  } catch (error) {
    console.error("Supabase connection error ❌", error);
    throw error;
  }
}
