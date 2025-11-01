'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface FolderOperationsProps {
  currentFolderId?: string
  onFolderCreated: () => void
  onFileMoved: () => void
}

export default function FolderOperations({ 
  currentFolderId, 
  onFolderCreated, 
  onFileMoved 
}: FolderOperationsProps) {
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string>('')

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    setLoading(true)
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return

      const { error } = await supabase
        .from('files')
        .insert({
          user_id: user.data.user.id,
          name: folderName.trim(),
          is_folder: true,
          parent_folder_id: currentFolderId || null,
          file_type: 'folder',
          size: 0
        })

      if (error) throw error

      setFolderName('')
      setShowCreateFolder(false)
      onFolderCreated()
    } catch (error: any) {
      alert('Error creating folder: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const moveFile = async (fileId: string, targetFolderId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ parent_folder_id: targetFolderId })
        .eq('id', fileId)

      if (error) throw error

      setShowMoveDialog(false)
      setSelectedFile('')
      onFileMoved()
    } catch (error: any) {
      alert('Error moving file: ' + error.message)
    }
  }

  return (
    <div className="flex gap-3 mb-6">
      {/* Create Folder Button */}
      <button
        onClick={() => setShowCreateFolder(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
      >
        📁 New Folder
      </button>

      {/* Create Folder Dialog */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <form onSubmit={createFolder}>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !folderName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}