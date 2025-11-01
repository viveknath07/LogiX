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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">🗑️ Trash</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ← Back to Files
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {trashedFiles.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            🧹 Trash is empty!
          </p>
        ) : (
          <div className="space-y-2">
            {trashedFiles.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">📄 {file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Folder'} •{' '}
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* Restore button */}
                  <button
                    onClick={() => restoreFile(file.id, file.name)}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    ♻️ Restore
                  </button>

                  {/* Permanently delete button */}
                  <button
                    onClick={() => permanentlyDelete(file.id, file.name, file.storage_path)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    🔥 Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
