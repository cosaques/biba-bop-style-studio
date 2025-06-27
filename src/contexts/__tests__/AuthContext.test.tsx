
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { mockSupabaseClient } from '@/test/setup'

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('should provide initial auth state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    // Initial state should be loading
    expect(result.current.loading).toBe(true)

    // Wait for auth to initialize
    await act(async () => {
      // Simulate auth initialization
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('should handle sign in', async () => {
    const mockSignInResponse = {
      data: { user: { id: 'test-user' }, session: { access_token: 'token' } },
      error: null
    }
    
    vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValue(mockSignInResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password')
      expect(response.error).toBeNull()
    })

    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })

  it('should handle sign out', async () => {
    vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
  })
})
