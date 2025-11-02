'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  username: string
  storageUsed: number
  storageLimit: number
}

export default function Sidebar({ username, storageUsed, storageLimit }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-60 h-full bg-white border-r border-gray-200 flex flex-col dark:bg-gray-900 dark:border-gray-800">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{username}</h2>
      </div>
      
      <nav className="flex-1 px-3">
        <Navigation />
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Storage</span>
            <span>{((storageUsed / storageLimit) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
            ></div>
          </div>
          <button
            className="w-full mt-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            Get more storage
          </button>
        </div>
      </div>
    </div>
  )
}