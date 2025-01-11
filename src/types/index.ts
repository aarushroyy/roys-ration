export interface RationItem {
    id: string
    name: string
    quantity?: string
    added_by: string
    created_at: string
  }
  
  export interface FamilyMember {
    id: string
    name: string
  }
  
  export type Screen = 'profiles' | 'menu' | 'add' | 'list'