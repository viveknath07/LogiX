'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  username: string
  storageUsed: number
  storageLimit: number
}

export default function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-60 h-full bg-white border-r border-gray-200 flex flex-col dark:bg-gray-900 dark:border-gray-800">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{username}</h2>
      </div>
      
      <nav className="flex-1">
        <div className="space-y-1 px-3">
          <Link
            href="/dashboard"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
              isActive('/dashboard')
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>

          <Link
            href="/dashboard/files"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
              isActive('/dashboard/files')
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            My files
          </Link>

          <Link
            href="/dashboard/shared"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
              isActive('/dashboard/shared')
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Shared
          </Link>

          <Link
            href="/dashboard/trash"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
              isActive('/dashboard/trash')
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Recycle bin
          </Link>
        </div>
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