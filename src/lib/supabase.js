import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://evnrecwbgfybdsmxvvhm.supabase.co'
const supabaseKey = 'sb_publishable_sKwkg0s082qZNlzfNxVo-g_VyyjXbBd'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)