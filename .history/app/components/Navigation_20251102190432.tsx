'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navigationItems = [
  { name: 'My Files', path: '/dashboard', icon: '📁' },
  { name: 'Shared', path: '/dashboard/shared', icon: '👥' },
  { name: 'Trash', path: '/dashboard/trash', icon: '🗑️' }
]

interface NavigationProps {
  className?: string
}

export default function Navigation({ className = '' }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className={`flex flex-col space-y-2 ${className}`}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.path
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}