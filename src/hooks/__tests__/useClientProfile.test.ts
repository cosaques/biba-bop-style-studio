
import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClientProfile } from '../useClientProfile'
import { mockSupabaseClient, createChainableMock } from '@/test/setup'

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}))

describe('useClientProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch client profile on mount', async () => {
    const mockProfile = {
      id: '1',
      user_id: 'test-user-id',
      age: 25,
      height: 170,
      weight: 65,
      gender: 'female'
    }

    // Create mock with the profile data
    const mockChain = createChainableMock({ data: mockProfile, error: null })
    vi.mocked(mockSupabaseClient.from).mockReturnValue(mockChain)

    const { result } = renderHook(() => useClientProfile())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profile).toEqual(mockProfile)
  })

  it('should create profile successfully', async () => {
    const profileData = {
      age: 30,
      height: 175,
      weight: 70,
      gender: 'male' as const
    }

    const createdProfile = {
      id: '2',
      user_id: 'test-user-id',
      ...profileData
    }

    // Create mock with the created profile data
    const mockChain = createChainableMock({ data: createdProfile, error: null })
    vi.mocked(mockSupabaseClient.from).mockReturnValue(mockChain)

    const { result } = renderHook(() => useClientProfile())

    await act(async () => {
      const createResult = await result.current.createProfile(profileData)
      expect(createResult.data).toEqual(createdProfile)
    })

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('client_profiles')
  })
})
