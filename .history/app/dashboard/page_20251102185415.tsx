'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Breadcrumbs from '../components/Breadcrumbs'

interface File {
  id: string
  name: string
  type: string
  size: number
  created_at: string
  modified_at: string
  is_folder: boolean
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentFiles, setRecentFiles] = useState<File[]>([])
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageLimit] = useState(5368709120) // 5GB in bytes

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header onSearch={() => {}} />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar 
          username={user?.email?.split('@')[0] || 'User'} 
          storageUsed={storageUsed}
          storageLimit={storageLimit}
        />
        
        <main className="flex-1 overflow-auto">
          {/* Quick Actions Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <span>+ New Folder</span>
                </button>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Categories */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Filter Tabs */}
              <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium">
                  All Files
                </button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  Images
                </button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  Documents
                </button>
                <button className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  PDFs
                </button>
              </div>

              {/* Quick Filters */}
              <div className="flex space-x-4">
                <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                  Recent
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                  Favorites
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                  Large Files
                </button>
              </div>

              {/* Trial Banner */}
              <div className="bg-[#f0f6ff] dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Get 100 GB free for a month
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Start your trial now to get more storage for all your files and photos.
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Start free trial
                  </button>
                </div>
              </div>

          {/* File List Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <FileList
                userId={user?.id}
                refreshTrigger={refreshTrigger}
                currentFolderId={currentFolderId}
                onFolderClick={setCurrentFolderId}
                onFileAction={() => {
                  setRefreshTrigger(prev => prev + 1)
                  getStorageInfo()
                }}
                searchQuery={searchQuery}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    My files
                  </h1>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                      Name
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                      Date
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                      Size
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <FileUpload
                    userId={user?.id}
                    currentFolderId={currentFolderId}
                    onUploadComplete={() => {
                      setRefreshTrigger(prev => prev + 1)
                      getStorageInfo()
                    }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <Breadcrumbs currentFolderId={currentFolderId} onNavigate={setCurrentFolderId} />
                </div>

                <FileList
                  userId={user?.id}
                  refreshTrigger={refreshTrigger}
                  currentFolderId={currentFolderId}
                  onFolderClick={setCurrentFolderId}
                  onFileAction={() => {
                    setRefreshTrigger(prev => prev + 1)
                    getStorageInfo()
                  }}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}