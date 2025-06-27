
import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export const renderHook = (hook: () => any) => {
  const queryClient = createTestQueryClient()
  
  const TestComponent = () => {
    const result = hook()
    // Store the result on the component for access
    ;(TestComponent as any).result = result
    return null
  }

  const { rerender, unmount } = render(
    <QueryClientProvider client={queryClient}>
      <TestComponent />
    </QueryClientProvider>
  )

  return {
    result: {
      get current() {
        return (TestComponent as any).result
      }
    },
    rerender: () => {
      const newQueryClient = createTestQueryClient()
      rerender(
        <QueryClientProvider client={newQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      )
    },
    unmount
  }
}

export const waitFor = async (callback: () => void | Promise<void>, options?: { timeout?: number }) => {
  const timeout = options?.timeout || 1000
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      await callback()
      return
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
  
  // Final attempt
  await callback()
}

export const act = async (callback: () => Promise<void> | void) => {
  await callback()
}
