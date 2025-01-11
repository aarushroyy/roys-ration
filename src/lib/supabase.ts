import { createClient } from '@supabase/supabase-js'
import { RationItem, FamilyMember } from '@/types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const dbOperations = {
  getItems: async (): Promise<RationItem[]> => {
    const { data, error } = await supabase
      .from('ration_items')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  getFamilyMembers: async (): Promise<FamilyMember[]> => {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
    
    if (error) throw error
    return data || []
  },

  addItem: async (item: { name: string; quantity?: string; addedBy: string }): Promise<RationItem> => {
    const { data, error } = await supabase
      .from('ration_items')
      .insert([{
        name: item.name,
        quantity: item.quantity,
        added_by: item.addedBy
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  clearList: async (): Promise<void> => {
    const { error } = await supabase
      .from('ration_items')
      .delete()
      .not('id', 'is', null) // This ensures we delete all rows

    if (error) {
      console.error('Delete error:', error) // Debug log
      throw error
    }
  },

  subscribeToChanges: (callback: (items: RationItem[]) => void): (() => void) => {
    const channel = supabase
      .channel('ration_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ration_items' },
        () => {
          dbOperations.getItems().then(callback)
        }
      )
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }
}