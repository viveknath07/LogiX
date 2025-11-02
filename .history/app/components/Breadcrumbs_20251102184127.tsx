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

export default function Breadcrumbs({ currentFolderId, onFolderClick }: BreadcrumbsProps) {
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
    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
      {/* Root folder */}
      <button
        onClick={() => onFolderClick()}
        className="hover:text-blue-600 transition-colors flex items-center gap-1"
      >
        🏠 Home
      </button>

      {/* Breadcrumb separators and folders */}
      {breadcrumbs.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-2">
          <span className="text-gray-400">/</span>
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 font-semibold">{folder.name}</span>
          ) : (
            <button
              onClick={() => onFolderClick(folder.id)}
              className="hover:text-blue-600 transition-colors"
            >
              {folder.name}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}