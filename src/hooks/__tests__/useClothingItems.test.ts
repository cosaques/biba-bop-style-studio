
import { renderHook, waitFor, act } from '@/test/utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClothingItems } from '../useClothingItems'
import { mockSupabaseClient, createChainableMock } from '@/test/setup'

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
    // Reset the mock implementation
    vi.mocked(mockSupabaseClient.from).mockReset()
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

    // Create mock with the items data
    const mockChain = createChainableMock({ data: mockItems, error: null })
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

    // First mock the fetch call that happens on mount
    let callCount = 0
    vi.mocked(mockSupabaseClient.from).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call - initial fetch returns empty array
        return createChainableMock({ data: [], error: null })
      } else {
        // Subsequent calls - create item returns the created item
        return createChainableMock({ data: createdItem, error: null })
      }
    })

    const { result } = renderHook(() => useClothingItems())

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verify items is initialized as empty array
    expect(Array.isArray(result.current.items)).toBe(true)
    expect(result.current.items).toEqual([])

    // Perform the create operation
    let createResult: any
    await act(async () => {
      createResult = await result.current.createItem(newItem)
    })

    expect(createResult.data).toEqual(createdItem)
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('clothing_items')
    
    // The state should be updated immediately after createItem resolves
    expect(Array.isArray(result.current.items)).toBe(true)
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toEqual(createdItem)
  })
})
