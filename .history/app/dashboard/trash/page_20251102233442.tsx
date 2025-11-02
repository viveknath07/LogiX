'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

interface TrashFile {
  id: string
  name: string
  size: number
  created_at: string
  storage_path: string
}

export default function TrashPage() {
  const [trashedFiles, setTrashedFiles] = useState<TrashFile[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchTrashedFiles()
  }, [])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/signin')
    }
  }

  // Fetch all deleted files (is_deleted = true)
  const fetchTrashedFiles = async () => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('is_deleted', true)  // Only deleted files
        .order('modified_at', { ascending: false })

      if (error) throw error
      setTrashedFiles(data || [])
    } catch (error: any) {
      alert('❌ Error fetching trash: ' + error.message)
    }
    setLoading(false)
  }

  // Restore file from trash
  const restoreFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Restore "${fileName}"?`)) return

    try {
      const { error } = await supabase
        .from('files')
        .update({ is_deleted: false })  // Mark as not deleted
        .eq('id', fileId)

      if (error) throw error
      alert('✅ File restored!')
      fetchTrashedFiles()
    } catch (error: any) {
      alert('❌ Restore failed: ' + error.message)
    }
  }

  // Permanently delete file
  const permanentlyDelete = async (fileId: string, fileName: string, storagePath: string) => {
    if (!confirm(`Permanently delete "${fileName}"? This cannot be undone!`)) return

    try {
      // Delete from storage
      await supabase.storage
        .from('files')
        .remove([storagePath])

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (error) throw error
      alert('🗑️ File permanently deleted!')
      fetchTrashedFiles()
    } catch (error: any) {
      alert('❌ Permanent delete failed: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">⏳ Loading trash...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recycle bin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Show Personal Vault items
              </button>
              <button
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Empty Recycle Bin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {trashedFiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No items in the Recycle bin
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-3 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="col-span-5 flex items-center space-x-1">
                Name
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div className="col-span-3">Original location</div>
              <div className="col-span-2">
                Date deleted
                <svg className="w-4 h-4 ml-1 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="col-span-2">
                Size
                <svg className="w-4 h-4 ml-1 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Table Body */}
            {trashedFiles.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
              >
                <div className="col-span-5 flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{file.name}</span>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Documents/Pictures</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '-'}
                  </span>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => restoreFile(file.id, file.name)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => permanentlyDelete(file.id, file.name, file.storage_path)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
