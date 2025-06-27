
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock the auth context
const mockUseAuth = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock the user profile context
vi.mock('@/contexts/UserProfileContext', () => ({
  useUserProfile: () => ({
    profile: { role: 'client' },
    loading: false
  })
}))

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated with correct role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user' },
      loading: false
    })

    render(
      <ProtectedRoute requiredRole="client">
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true
    })

    render(
      <ProtectedRoute requiredRole="client">
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('should redirect when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false
    })

    render(
      <ProtectedRoute requiredRole="client">
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
