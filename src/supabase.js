// Supabase client (extracted Stage 1)
import * as supabase from '@supabase/supabase-js';
import { SUPA_URL, SUPA_KEY } from './config.js';
export const supa = supabase.createClient(SUPA_URL, SUPA_KEY);
