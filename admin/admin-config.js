// WBDYM Supabase Configuration
// Public/publishable key only — never put a secret/service_role key here.

const SUPABASE_URL = "https://oahuhywputxkncddlmol.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Me95pbzCTvG9kFV3frVXDw_l5YpafnG";

// Compatibility configuration for the admin panel
window.WBDYM_CONFIG = {
  SUPABASE_URL: SUPABASE_URL,
  SUPABASE_ANON_KEY: SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_PUBLISHABLE_KEY: SUPABASE_PUBLISHABLE_KEY
};
