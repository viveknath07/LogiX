'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageLimit] = useState(5368709120) // 5GB in bytes
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')

  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/signin')
    } else {
      setUser(data.user)
      getStorageInfo()
    }
    setLoading(false)
  }

  const getStorageInfo = async () => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return

      const { data, error } = await supabase
        .from('files')
        .select('size')
        .eq('user_id', user.data.user.id)
        .eq('is_deleted', false)
        .eq('is_folder', false)

      if (error) throw error

      const totalUsed = data?.reduce((sum, file) => sum + (file.size || 0), 0) || 0
      setStorageUsed(totalUsed)
    } catch (error) {
      console.log('Could not get storage info')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const handleFolderClick = (folderId?: string) => {
    setCurrentFolderId(folderId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your files...</p>
        </div>
      </div>
    )
  }

  const storagePercentage = Math.min((storageUsed / storageLimit) * 100, 100)
  const storageColor = storagePercentage > 90 ? 'bg-red-600' :
    storagePercentage > 75 ? 'bg-yellow-600' : 'bg-blue-600'

  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user) return

    try {
      const { error } = await supabase.from('files').insert({
        name: newFolderName,
        is_folder: true,
        user_id: user.id,
      })

      if (error) throw error
      setNewFolderName('')
      setIsCreatingFolder(false)
      setShowCreateMenu(false)
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (!user) return
    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file, {
            onUploadProgress: (progressEvent: { loaded: number; total: number }) => {
              const progress = (progressEvent.loaded / progressEvent.total) * 100
              setUploadProgress(progress)
            },
          })

        if (uploadError) throw uploadError

        const { error: dbError } = await supabase.from('files').insert({
          name: file.name,
          storage_path: filePath,
          size: file.size,
          file_type: file.type,
          user_id: user.id,
        })

        if (dbError) throw dbError
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles)
  }, [user])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: isCreatingFolder 
  })

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header onSearch={setSearchQuery} />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar 
          username={user?.email?.split('@')[0] || 'User'} 
          storageUsed={storageUsed}
          storageLimit={storageLimit}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Upload Files
                </h1>

                <div className="relative">
                  <button
                    onClick={() => setShowCreateMenu(!showCreateMenu)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create or upload</span>
                  </button>

                  {showCreateMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsCreatingFolder(true)
                            setShowCreateMenu(false)
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          New Folder
                        </button>
                        <label className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          Upload Files
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileUpload(Array.from(e.target.files))
                              }
                              setShowCreateMenu(false)
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                {...getRootProps()}
                className={`p-12 border-2 border-dashed rounded-lg ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <input {...getInputProps()} />
                
                {isCreatingFolder ? (
                  <div className="flex flex-col items-center space-y-4">
                    <input
                      type="text"
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreateFolder}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setIsCreatingFolder(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8" />
                    </svg>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isDragActive ? 'Drop your files here' : 'Drag and drop your files here'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        or click to browse
                      </p>
                    </div>

                    {isUploading && (
                      <div className="w-full max-w-md">
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
                                Uploading
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                                {Math.round(uploadProgress)}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-gray-700">
                            <div
                              style={{ width: `${uploadProgress}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}