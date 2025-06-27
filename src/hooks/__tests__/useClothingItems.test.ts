
import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClothingItems } from '../useClothingItems'
import { mockSupabaseClient } from '@/test/setup'

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}))

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('useClothingItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch clothing items on mount', async () => {
    const mockItems = [
      {
        id: '1',
        user_id: 'test-user-id',
        image_url: 'test-image.jpg',
        category: 'top',
        color: 'blue',
        season: 'all',
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    ]

    // Mock the Supabase chain
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockItems, error: null })
    }
    
    vi.mocked(mockSupabaseClient.from).mockReturnValue(mockChain)

    const { result } = renderHook(() => useClothingItems())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toEqual(mockItems)
  })

  it('should handle create item successfully', async () => {
    const newItem = {
      image_url: 'new-image.jpg',
      category: 'top' as const,
      color: 'red' as const,
      season: 'summer' as const
    }

    const createdItem = {
      id: '2',
      user_id: 'test-user-id',
      ...newItem,
      created_at: '2023-01-02',
      updated_at: '2023-01-02'
    }

    // Mock the Supabase chain for creation
    const mockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: createdItem, error: null })
    }
    
    vi.mocked(mockSupabaseClient.from).mockReturnValue(mockChain)

    const { result } = renderHook(() => useClothingItems())

    await act(async () => {
      const createResult = await result.current.createItem(newItem)
      expect(createResult.data).toEqual(createdItem)
    })

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('clothing_items')
  })
})
