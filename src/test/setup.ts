
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Create a proper chainable mock for Supabase queries
const createChainableMock = (finalResult = { data: null, error: null }) => {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve(finalResult)),
    maybeSingle: vi.fn(() => Promise.resolve(finalResult)),
    order: vi.fn(() => Promise.resolve(finalResult)),
  }
  
  // Make sure all methods return the same chainable object, except for the terminal methods
  Object.keys(chainable).forEach(key => {
    if (typeof chainable[key] === 'function' && !['single', 'maybeSingle', 'order'].includes(key)) {
      chainable[key].mockReturnValue(chainable)
    }
  })
  
  return chainable
}

// Mock Supabase client with proper chaining
const mockSupabaseClient = {
  auth: {
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
  },
  from: vi.fn(() => createChainableMock()),
  storage: {
    from: vi.fn(() => ({
      remove: vi.fn(() => Promise.resolve({ error: null })),
      upload: vi.fn(() => Promise.resolve({ error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: '' } })),
    })),
  },
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}))

// Mock React Router with proper navigate function
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: vi.fn(() => ({ pathname: '/' })),
    useParams: vi.fn(() => ({})),
    useOutletContext: vi.fn(() => ({})),
  }
})

// Export the mocks for use in tests
export { mockSupabaseClient, mockNavigate, createChainableMock }
