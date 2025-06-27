
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@/test/utils'
import { ProtectedRoute } from '../ProtectedRoute'
import { mockNavigate } from '@/test/setup'

// Mock the auth context
const mockUseAuth = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock the user profile context
const mockUseUserProfile = vi.fn()
vi.mock('@/contexts/UserProfileContext', () => ({
  useUserProfile: () => mockUseUserProfile()
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children when user is authenticated with correct role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user' },
      loading: false
    })

    mockUseUserProfile.mockReturnValue({
      profile: { role: 'client' },
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

    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: false
    })

    render(
      <ProtectedRoute requiredRole="client">
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('should redirect when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false
    })

    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: false
    })

    await act(async () => {
      render(
        <ProtectedRoute requiredRole="client">
          <div>Protected Content</div>
        </ProtectedRoute>
      )
    })

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    
    // Should call navigate to login
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
