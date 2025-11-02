'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface File {
  id: string
  name: string
  size: number
  created_at: string
  modified_at: string
  type: string
  is_folder: boolean
  sharing: 'private' | 'shared'
}

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order(sortBy, { ascending: sortOrder === 'asc' })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string, isFolder: boolean) => {
    if (isFolder) return '📁'
    switch (type) {
      case 'pdf': return '📄'
      case 'image': return '🖼️'
      case 'document': return '📝'
      default: return '📄'
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  return (
    <div className="w-full">
      {/* File list header */}
      <div className="flex items-center bg-white dark:bg-gray-800 px-6 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-1 min-w-0">
          <button 
            onClick={() => handleSort('name')}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <span>Name</span>
            {sortBy === 'name' && (
              <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button 
            onClick={() => handleSort('modified_at')}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <span>Modified</span>
            {sortBy === 'modified_at' && (
              <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button 
            onClick={() => handleSort('size')}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <span>Size</span>
            {sortBy === 'size' && (
              <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-gray-500 dark:text-gray-400">No files yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Upload files or create folders to get started</p>
          </div>
        ) : (
          files.map((file) => (
            <div 
              key={file.id}
              className="flex items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
            >
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-xl mr-3">{getFileIcon(file.type, file.is_folder)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(file.modified_at || file.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                  {file.is_folder ? '-' : formatFileSize(file.size)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {file.sharing}
                </span>
                <div className="hidden group-hover:flex items-center ml-4 space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <span className="sr-only">Share</span>
                    📤
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <span className="sr-only">More</span>
                    ⋯
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}