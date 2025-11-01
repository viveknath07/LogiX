'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface SharedFile {
  id: string
  permission: string
  files: {
    id: string
    name: string
    size: number
    file_type: string
    created_at: string
    storage_path: string
    is_folder: boolean
    is_deleted: boolean
  } | null
}

export default function SharedWithMe() {
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSharedFiles()
  }, [])

  const fetchSharedFiles = async () => {
    setLoading(true)
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      setSharedFiles([])
      setLoading(false)
      return
    }
    const email = user.data.user.email

    const { data, error } = await supabase
      .from('shared_files')
      .select('id, permission, files(*)') // Join files table
      .eq('shared_with_user_email', email)
      .order('id', { ascending: false })

    if (error) {
      alert('Failed to load shared files: ' + error.message)
      setSharedFiles([])
    } else {
      setSharedFiles(data ?? [])
    }
    setLoading(false)
  }

  if (loading) return <p>Loading shared files...</p>

  if (sharedFiles.length === 0)
    return <p className="text-center mt-6">No files have been shared with you.</p>

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-3">
      <h2 className="text-2xl font-semibold mb-4">Shared With Me</h2>
      <ul>
        {sharedFiles.map((shared) => {
          if (!shared.files) return null
          return (
            <li
              key={shared.id}
              className="flex justify-between p-4 border border-gray-300 rounded shadow-sm"
            >
              <div>
                <p className="font-medium">{shared.files.name}</p>
                <p className="text-sm text-gray-500">
                  {shared.files.is_folder ? 'Folder' : `${(shared.files.size / 1024).toFixed(2)} KB`}
                </p>
              </div>
              <div>
                <span className="text-sm font-semibold px-3 py-1 rounded bg-gray-200">
                  {shared.permission}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
