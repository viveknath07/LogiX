'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import FileUpload from '@/app/components/FileUpload'
import FileList from '@/app/components/FileList'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageLimit] = useState(5368709120) // 5GB
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>()

  const router = useRouter()

  // When component loads, check if user is logged in
  useEffect(() => {
    checkAuth()
  }, [])

  // Check if user is logged in
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

  // Get storage usage info
  const getStorageInfo = async () => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return

      // Get user's total file sizes (excluding folders)
      const { data, error } = await supabase
        .from('files')
        .select('size')
        .eq('user_id', user.data.user.id)
        .eq('is_deleted', false)
        .eq('is_folder', false)

      if (error) throw error

      // Calculate total storage used
      const totalUsed = data?.reduce((sum, file) => sum + (file.size || 0), 0) || 0
      setStorageUsed(totalUsed)
    } catch (error) {
      console.log('Could not get storage info')
    }
  }

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  // Handle folder navigation
  const handleFolderClick = (folderId?: string) => {
    setCurrentFolderId(folderId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your files...</p>
        </div>
      </div>
    )
  }

  // Calculate storage percentage
  const storagePercentage = Math.min((storageUsed / storageLimit) * 100, 100)
  const storageColor = storagePercentage > 90 ? 'bg-red-600' : 
                       storagePercentage > 75 ? 'bg-yellow-600' : 'bg-blue-600'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <span className="text-xl">☁️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">OnDrive</h1>
              <p className="text-xs text-gray-600">Secure Cloud Storage</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 hidden sm:block">Welcome back</p>
              <p className="text-sm font-semibold text-gray-800">
                {user?.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Storage info */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Storage Usage</p>
            <p className="text-sm text-gray-600">
              {(storageUsed / 1024 / 1024).toFixed(2)} MB / {(storageLimit / 1024 / 1024 / 1024).toFixed(1)} GB
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${storageColor}`}
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {storagePercentage.toFixed(1)}% of storage used
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            📁 My Files
          </button>
          <button
            onClick={() => router.push('/dashboard/shared-with-me')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            👥 Shared with Me
          </button>
          <button
            onClick={() => router.push('/dashboard/trash')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            🗑️ Trash
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {currentFolderId ? '📁 Current Folder' : '📤 Upload Files'}
          </h2>
          <FileUpload
            onUploadComplete={() => {
              setRefreshTrigger((prev) => prev + 1)
              getStorageInfo()
            }}
          />
        </div>

        {/* Files Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {currentFolderId ? '📂 Folder Contents' : '📂 My Files'}
          </h2>
          <FileList 
            refreshTrigger={refreshTrigger}
            currentFolderId={currentFolderId}
            onFolderClick={handleFolderClick}
          />
        </div>
      </div>
    </div>
  )
  
}