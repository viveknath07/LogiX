'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/app/lib/supabase'
import FileVersions from './FileVersions'
import ShareDialog from './ShareDialog'
import SearchBar from './SearchBar'
import FilePreview from './FilePreview'
import FolderOperations from './FolderOperations'
import Breadcrumbs from './Breadcrumbs'

interface File {
  id: string
  name: string
  size: number
  file_type: string
  created_at: string
  storage_path: string
  is_folder: boolean
  is_deleted: boolean
  is_favorite?: boolean
  parent_folder_id?: string
}

interface FileListProps {
  userId?: string
  refreshTrigger: number
  currentFolderId?: string
  onFolderClick: (folderId?: string) => void
  onFileAction: () => void
  searchQuery?: string
}

export default function FileList({ 
  refreshTrigger, 
  currentFolderId, 
  onFolderClick 
}: FileListProps) {
  const [files, setFiles] = useState<File[]>([])
  const [filteredFiles, setFilteredFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [shareDialog, setShareDialog] = useState({
    isOpen: false,
    fileId: '',
    fileName: ''
  })
  const [previewFile, setPreviewFile] = useState<File | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentSort, setCurrentSort] = useState('newest')

  useEffect(() => {
    fetchFiles()
  }, [refreshTrigger, currentFolderId])

  // Apply search, filter, and sort whenever they change
  useEffect(() => {
    applyFiltersAndSort()
  }, [files, searchQuery, currentFilter, currentSort])

  // Fetch all files and mark favorites
  const fetchFiles = async () => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return
      const userId = user.data.user.id

      // Build the query
      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)

      // Handle parent_folder_id condition properly
      if (currentFolderId) {
        query = query.eq('parent_folder_id', currentFolderId)
      } else {
        query = query.is('parent_folder_id', null) // Use .is() for NULL comparison
      }

      // Execute the query
      const { data, error } = await query
        .order('is_folder', { ascending: false }) // Folders first
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get favorites for this user
      const { data: favs, error: favError } = await supabase
        .from('favorites')
        .select('file_id')
        .eq('user_id', userId)

      if (favError) throw favError

      // Add is_favorite flag to files
      const favSet = new Set((favs ?? []).map((row: any) => row.file_id))
      const markedFiles = data ? data.map((file: any) => ({
        ...file,
        is_favorite: favSet.has(file.id)
      })) : []

      setFiles(markedFiles)
    } catch (error: any) {
      alert('Error fetching files: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Apply search, filters, and sorting
  const applyFiltersAndSort = () => {
    let result = [...files]

    // Apply search
    if (searchQuery) {
      result = result.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    switch (currentFilter) {
      case 'image':
        result = result.filter(file => file.file_type?.startsWith('image/'))
        break
      case 'document':
        result = result.filter(file => 
          file.file_type?.includes('word') || 
          file.file_type?.includes('excel') ||
          file.file_type?.includes('powerpoint') ||
          file.file_type?.includes('text') ||
          file.file_type === 'application/msword' ||
          file.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        break
      case 'pdf':
        result = result.filter(file => file.file_type === 'application/pdf')
        break
      case 'video':
        result = result.filter(file => file.file_type?.startsWith('video/'))
        break
      case 'audio':
        result = result.filter(file => file.file_type?.startsWith('audio/'))
        break
      case 'folders':
        result = result.filter(file => file.is_folder)
        break
      case 'files':
        result = result.filter(file => !file.is_folder)
        break
      case 'recent':
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        result = result.filter(file => new Date(file.created_at) > oneWeekAgo)
        break
      case 'favorites':
        result = result.filter(file => file.is_favorite)
        break
      case 'large':
        result = result.filter(file => file.size && file.size > 10 * 1024 * 1024) // > 10MB
        break
      case 'all':
      default:
        // No filter applied
        break
    }

    // Apply sorting
    switch (currentSort) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'size-asc':
        result.sort((a, b) => (a.size || 0) - (b.size || 0))
        break
      case 'size-desc':
        result.sort((a, b) => (b.size || 0) - (a.size || 0))
        break
      case 'type':
        result.sort((a, b) => {
          if (a.is_folder && !b.is_folder) return -1
          if (!a.is_folder && b.is_folder) return 1
          return a.name.localeCompare(b.name)
        })
        break
    }

    setFilteredFiles(result)
  }

  // Search, filter and sort handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFilter = useCallback((filter: string) => {
    setCurrentFilter(filter)
  }, [])

  const handleSort = useCallback((sort: string) => {
    setCurrentSort(sort)
  }, [])

  // Check if file can be previewed
  const canPreviewFile = useCallback((file: File) => {
    if (file.is_folder) return false
    
    const type = file.file_type
    return (
      type?.startsWith('image/') ||
      type === 'application/pdf' ||
      type?.startsWith('video/') ||
      type?.startsWith('audio/') ||
      type?.startsWith('text/') ||
      file.name.endsWith('.txt')
    )
  }, [])

  // Delete file (move to trash bin)
  const deleteFile = useCallback(async (fileId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return

    try {
      const { error } = await supabase
        .from('files')
        .update({ is_deleted: true })
        .eq('id', fileId)

      if (error) throw error
      fetchFiles()
    } catch (error: any) {
      alert('❌ Delete failed: ' + error.message)
    }
  }, [fetchFiles])

  // Rename file
  const renameFile = useCallback(async (fileId: string, oldName: string) => {
    const newName = prompt('New name:', oldName)
    if (!newName || newName === oldName) return

    try {
      const { error } = await supabase
        .from('files')
        .update({ name: newName })
        .eq('id', fileId)

      if (error) throw error
      fetchFiles()
    } catch (error: any) {
      alert('❌ Rename failed: ' + error.message)
    }
  }, [fetchFiles])

  // Download file
  const downloadFile = useCallback(async (file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.storage_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.click()
    } catch (error: any) {
      alert('❌ Download failed: ' + error.message)
    }
  }, [])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (fileId: string) => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return
      
      const userId = user.data.user.id

      // Check if already favorite
      const { data: existing, error } = await supabase
        .from('favorites')
        .select('file_id')
        .eq('user_id', userId)
        .eq('file_id', fileId)

      if (error) throw error

      if (existing && existing.length > 0) {
        // Remove favorite
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('file_id', fileId)
      } else {
        // Add favorite
        await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            file_id: fileId,
          })
      }
      fetchFiles()
    } catch (error: any) {
      alert('❌ Favorite update failed: ' + error.message)
    }
  }

  // Handle share success
  const handleShareSuccess = useCallback(() => {
    fetchFiles()
  }, [])

  // Handle folder operations
  const handleFolderCreated = useCallback(() => {
    fetchFiles()
  }, [])

  const handleFileMoved = useCallback(() => {
    fetchFiles()
  }, [])

  // Get file icon based on type
  const getFileIcon = useCallback((file: File) => {
    if (file.is_folder) return '📁'
    
    const type = file.file_type
    if (type?.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📕'
    if (type?.includes('word') || type?.includes('document')) return '📄'
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊'
    if (type?.includes('powerpoint') || type?.includes('presentation')) return '📑'
    if (type?.startsWith('video/')) return '🎥'
    if (type?.startsWith('audio/')) return '🎵'
    if (type?.includes('zip') || type?.includes('compressed')) return '🗜️'
    
    return '📄'
  }, [])

  if (loading) {
    return <p className="text-gray-500">📁 Loading files...</p>
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs 
        currentFolderId={currentFolderId} 
        onFolderClick={onFolderClick}
      />

      {/* Folder Operations */}
      <FolderOperations
        currentFolderId={currentFolderId}
        onFolderCreated={handleFolderCreated}
        onFileMoved={handleFileMoved}
      />

      {/* Search and Filter Bar */}
      <SearchBar 
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
      />

      {/* Results Info */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredFiles.length} of {files.length} items
          {searchQuery && ` for "${searchQuery}"`}
          {currentFilter !== 'all' && ` • Filter: ${currentFilter}`}
        </p>
        {(searchQuery || currentFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('')
              setCurrentFilter('all')
              setCurrentSort('newest')
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">
            {files.length === 0 ? '📂 This folder is empty' : '🔍 No items match your search'}
          </p>
          <p className="text-gray-400">
            {files.length === 0 
              ? 'Upload a file or create a folder to get started!' 
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* File/Folder info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getFileIcon(file)}</span>
                  <div>
                    {file.is_folder ? (
                      <button
                        onClick={() => onFolderClick(file.id)}
                        className="font-semibold text-gray-800 text-lg hover:text-blue-600 transition-colors text-left"
                      >
                        {file.name}
                      </button>
                    ) : (
                      <p className="font-semibold text-gray-800 text-lg">
                        {file.name}
                        {file.is_favorite && <span className="ml-2 text-yellow-500">⭐</span>}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {file.is_folder ? (
                        'Folder'
                      ) : (
                        `${file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'} • ${file.file_type || 'Unknown type'}`
                      )}
                      {' • '}{new Date(file.created_at).toLocaleDateString()}
                      {!file.is_folder && canPreviewFile(file) && (
                        <span className="ml-2 text-green-600 font-medium">👁️ Preview Available</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {file.is_folder ? (
                  // Folder actions
                  <>
                    <button
                      onClick={() => onFolderClick(file.id)}
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                      title="Open folder"
                    >
                      📂 Open
                    </button>
                    <button
                      onClick={() => renameFile(file.id, file.name)}
                      className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors flex items-center gap-1"
                      title="Rename folder"
                    >
                      ✏️ Rename
                    </button>
                  </>
                ) : (
                  // File actions
                  <>
                    {/* Preview button - only show for previewable files */}
                    {canPreviewFile(file) && (
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="bg-teal-600 text-white px-3 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-1"
                        title="Preview file"
                      >
                        👁️ Preview
                      </button>
                    )}

                    {/* Versions button */}
                    <FileVersions fileId={file.id} />

                    {/* Download button */}
                    <button
                      onClick={() => downloadFile(file)}
                      className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                      title="Download file"
                    >
                      📥 Download
                    </button>

                    {/* Share button */}
                    <button
                      onClick={() => setShareDialog({
                        isOpen: true,
                        fileId: file.id,
                        fileName: file.name
                      })}
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                      title="Share file"
                    >
                      🔗 Share
                    </button>

                    {/* Rename button */}
                    <button
                      onClick={() => renameFile(file.id, file.name)}
                      className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors flex items-center gap-1"
                      title="Rename file"
                    >
                      ✏️ Rename
                    </button>

                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorite(file.id)}
                      className={`px-3 py-2 rounded text-sm transition-colors flex items-center gap-1 ${
                        file.is_favorite 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={file.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {file.is_favorite ? '⭐ Favorited' : '☆ Favorite'}
                    </button>
                  </>
                )}

                {/* Delete button */}
                <button
                  onClick={() => deleteFile(file.id, file.name)}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                  title={`Delete ${file.is_folder ? 'folder' : 'file'}`}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        fileId={shareDialog.fileId}
        fileName={shareDialog.fileName}
        isOpen={shareDialog.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileId: '', fileName: '' })}
        onShareSuccess={handleShareSuccess}
      />

      {/* File Preview Dialog */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}