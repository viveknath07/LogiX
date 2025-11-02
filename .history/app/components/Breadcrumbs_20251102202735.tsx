'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface BreadcrumbsProps {
  currentFolderId?: string
  onNavigate: (folderId?: string) => void
}

interface Folder {
  id: string
  name: string
  parent_folder_id?: string
}

export default function Breadcrumbs({ currentFolderId, onNavigate }: BreadcrumbsProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([])

  useEffect(() => {
    loadBreadcrumbs()
  }, [currentFolderId])

  const loadBreadcrumbs = async () => {
    if (!currentFolderId) {
      setBreadcrumbs([])
      return
    }

    try {
      const folders: Folder[] = []
      let currentId: string | undefined = currentFolderId

      // Build breadcrumb path by traversing up the folder tree
      while (currentId) {
        const { data: folder, error } = await supabase
          .from('files')
          .select('id, name, parent_folder_id')
          .eq('id', currentId)
          .single()

        if (error || !folder) break

        folders.unshift(folder) // Add to beginning of array
        currentId = folder.parent_folder_id || undefined
      }

      setBreadcrumbs(folders)
    } catch (error) {
      console.error('Error loading breadcrumbs:', error)
    }
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-600">
      {breadcrumbs.length > 0 ? (
        <>
          <button
            onClick={() => onNavigate(undefined)}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
            title="Return to Home"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {breadcrumbs.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-1">
              <span className="text-gray-400 select-none">/</span>
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-xs">
                  {folder.name}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(folder.id)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-xs"
                >
                  {folder.name}
                </button>
              )}
            </div>
          ))}
        </>
      ) : (
        <span className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </span>
      )}
    </div>
  )
}