'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FileIcon, ImageIcon, StarIcon, TrashIcon, HomeIcon, FolderIcon } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [showFolders, setShowFolders] = useState(true)

  const isActive = (path: string) => pathname === path

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Home' },
    { path: '/dashboard/files', icon: FileIcon, label: 'My Files' },
    { path: '/dashboard/photos', icon: ImageIcon, label: 'Photos' },
    { path: '/dashboard/shared', icon: FolderIcon, label: 'Shared' },
    { path: '/dashboard/favorites', icon: StarIcon, label: 'Favorites' },
    { path: '/dashboard/trash', icon: TrashIcon, label: 'Recycle Bin' }
  ]

  return (
    <nav className="w-64 h-[calc(100vh-3.5rem)] flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 space-y-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive(item.path)
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Storage</span>
            <span>0.3% used</span>
          </div>
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" 
              style={{ width: '0.3%' }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            15.7 MB of 5 GB used
          </span>
          <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Get more storage
          </button>
        </div>
      </div>
    </nav>
  )
}
