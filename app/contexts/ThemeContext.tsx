'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check for saved theme preference or use system preference
    try {
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme)
      } else {
        // Use system preference only if no saved preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(systemPrefersDark ? 'dark' : 'light')
      }
    } catch (error) {
      console.log('Error reading theme from localStorage:', error)
      setTheme('light') // Fallback to light theme
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    try {
      const root = document.documentElement
      
      // Remove both classes first to ensure clean state
      root.classList.remove('light', 'dark')
      
      // Add the current theme class
      root.classList.add(theme)
      
      // Save to localStorage
      localStorage.setItem('theme', theme)
      
      console.log('Theme updated to:', theme) // Debug log
    } catch (error) {
      console.log('Error updating theme:', error)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    console.log('Toggling theme from:', theme) // Debug log
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      console.log('New theme will be:', newTheme) // Debug log
      return newTheme
    })
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}