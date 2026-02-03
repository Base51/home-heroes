import { supabase } from '@/lib/supabase'

/**
 * Update a hero's avatar
 * @param heroId - The hero's ID
 * @param avatar - The emoji string or image URL to set as avatar
 * @returns true if successful, false otherwise
 */
export async function updateHeroAvatar(heroId: string, avatar: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('heroes')
      .update({ 
        avatar_url: avatar, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', heroId)

    if (error) {
      console.error('❌ Failed to update hero avatar:', error)
      return false
    }

    console.log('✅ Hero avatar updated:', avatar)
    return true
  } catch (err) {
    console.error('❌ Error updating hero avatar:', err)
    return false
  }
}

/**
 * Update a hero's name
 * @param heroId - The hero's ID
 * @param heroName - The new hero name
 * @returns true if successful, false otherwise
 */
export async function updateHeroName(heroId: string, heroName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('heroes')
      .update({ 
        hero_name: heroName, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', heroId)

    if (error) {
      console.error('❌ Failed to update hero name:', error)
      return false
    }

    console.log('✅ Hero name updated:', heroName)
    return true
  } catch (err) {
    console.error('❌ Error updating hero name:', err)
    return false
  }
}
