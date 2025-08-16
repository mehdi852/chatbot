// For client-side operations, use Supabase client
// For server-side operations, import from './db.server.js'
import { createClient } from '../utils/supabase/client';

export const supabase = createClient();
