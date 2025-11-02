'use client'

import { useEffect, useState } from 'react'
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

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Filter handler
  const handleFilter = (filter: string) => {
    setCurrentFilter(filter)
  }

  // Sort handler
  const handleSort = (sort: string) => {
    setCurrentSort(sort)
  }

  // Check if file can be previewed
  const canPreviewFile = (file: File) => {
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
  }

  // Delete file (move to trash bin)
  const deleteFile = async (fileId: string, fileName: string) => {
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
  }

  // Rename file
  const renameFile = async (fileId: string, oldName: string) => {
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
  }

  // Download file
  const downloadFile = async (file: File) => {
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
  }

  // Toggle favorite status
  const toggleFavorite = async (fileId: string) => {
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
  const handleShareSuccess = () => {
    fetchFiles()
  }

  // Handle folder operations
  const handleFolderCreated = () => {
    fetchFiles()
  }

  const handleFileMoved = () => {
    fetchFiles()
  }

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.is_folder) {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    }

    const type = file.file_type
    if (type?.startsWith('image/')) {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }

    if (type === 'application/pdf') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }

    if (type?.includes('word') || type?.includes('document')) {
      return (
        <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }

    if (type?.includes('excel') || type?.includes('spreadsheet')) {
      return (
        <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }

    if (type?.includes('powerpoint') || type?.includes('presentation')) {
      return (
        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }

    if (type?.startsWith('video/')) {
      return (
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }

    if (type?.startsWith('audio/')) {
      return (
        <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    }

    if (type?.includes('zip') || type?.includes('compressed')) {
      return (
        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }

    return (
      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  }

  if (loading) {
    return <p className="text-gray-500">📁 Loading files...</p>
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs 
        currentFolderId={currentFolderId} 
        onNavigate={onFolderClick}
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
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {files.length === 0 ? '📂 This folder is empty' : '🔍 No items match your search'}
          </p>
          <p className="text-gray-400 dark:text-gray-500">
            {files.length === 0 
              ? 'Upload a file or create a folder to get started!' 
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4 py-3">
              <button
                onClick={() => handleSort('name')}
                className="flex-1 text-left text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Name {currentSort === 'name-asc' ? '↑' : currentSort === 'name-desc' ? '↓' : ''}
              </button>
              <div className="flex space-x-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => handleSort('newest')}
                  className="hidden sm:block min-w-[100px] text-left hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Date {currentSort === 'newest' ? '↓' : currentSort === 'oldest' ? '↑' : ''}
                </button>
                <button
                  onClick={() => handleSort('size')}
                  className="hidden sm:block min-w-[100px] text-left hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Size {currentSort === 'size-desc' ? '↓' : currentSort === 'size-asc' ? '↑' : ''}
                </button>
                <button
                  onClick={() => handleSort('type')}
                  className="hidden sm:block min-w-[100px] text-left hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Type {currentSort === 'type' ? '↑' : ''}
                </button>
                <div className="w-[216px]" /> {/* Space for actions */}
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">{filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0 mr-3">
                  {getFileIcon(file)}
                </div>
                <div className="min-w-0 flex-1">
                  {file.is_folder ? (
                    <button
                      onClick={() => onFolderClick(file.id)}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                    >
                      {file.name}
                    </button>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                      {file.is_favorite && <span className="ml-2 text-yellow-500">⭐</span>}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline min-w-[100px]">
                  {new Date(file.created_at).toLocaleDateString()}
                </span>
                <span className="hidden sm:inline min-w-[100px] ml-4">
                  {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '-'}
                </span>
                <span className="hidden sm:inline min-w-[100px] ml-4">
                  {file.is_folder ? 'Folder' : file.file_type || 'Unknown'}
                </span>
              </div>

              <div className="ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex -mx-1">
                  {canPreviewFile(file) && !file.is_folder && (
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="mx-1 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Preview file"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}

                  {!file.is_folder && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="mx-1 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Download file"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  )}

                  {!file.is_folder && (
                    <button
                      onClick={() => setShareDialog({
                        isOpen: true,
                        fileId: file.id,
                        fileName: file.name
                      })}
                      className="mx-1 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Share file"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => renameFile(file.id, file.name)}
                    className="mx-1 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Rename"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {!file.is_folder && (
                    <button
                      onClick={() => toggleFavorite(file.id)}
                      className={`mx-1 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        file.is_favorite 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                      title={file.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg className="w-5 h-5" fill={file.is_favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => deleteFile(file.id, file.name)}
                    className="mx-1 p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}</div>
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