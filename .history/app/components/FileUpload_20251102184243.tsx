'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/app/lib/supabase'

interface FileUploadProps {
  userId?: string
  currentFolderId?: string
  onUploadComplete: () => void
}

export default function FileUpload({ userId, currentFolderId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setUploadProgress(0)

    for (const file of acceptedFiles) {
      try {
        const user = await supabase.auth.getUser()
        if (!user.data.user) {
          alert('❌ Not logged in')
          return
        }

        const filePath = `${user.data.user.id}/${Date.now()}-${file.name}`

        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Check if file already exists
        const { data: existingFile, error: existingFileError } = await supabase
          .from('files')
          .select('id, storage_path')
          .eq('user_id', user.data.user.id)
          .eq('name', file.name)
          .eq('is_deleted', false)
          .single()

        if (existingFileError && existingFileError.code !== 'PGRST116') {
          // Ignore not-found error, throw others
          throw existingFileError
        }

        if (existingFile) {
          // Save old version of file
          const { error: versionError } = await supabase
            .from('file_versions')
            .insert({
              file_id: existingFile.id,
              version_number: 1,
              storage_path: existingFile.storage_path,
              author_id: user.data.user.id,
            })

          if (versionError) throw versionError

          // Update the file record to new storage path and size
          const { error: updateError } = await supabase
            .from('files')
            .update({
              storage_path: filePath,
              size: file.size,
              modified_at: new Date(),
            })
            .eq('id', existingFile.id)

          if (updateError) throw updateError
        } else {
          // Insert a new file row
          const { error: insertError } = await supabase
            .from('files')
            .insert({
              user_id: user.data.user.id,
              name: file.name,
              size: file.size,
              file_type: file.type,
              storage_path: filePath,
              is_folder: false,
            })

          if (insertError) throw insertError
        }

        setUploadProgress((prev) => prev + 33)
      } catch (error: any) {
        alert('❌ Upload failed: ' + error.message)
      }
    }

    setUploading(false)
    setUploadProgress(0)
    onUploadComplete()
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition ${
        isDragActive ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
      } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} disabled={uploading} />
      <div className="text-center">
        <p className="text-2xl mb-2">📁</p>
        <p className="text-gray-700 font-semibold">
          {uploading
            ? `⏳ Uploading... ${uploadProgress}%`
            : '📤 Drag files here or click to select'}
        </p>
      </div>
    </div>
  )
}
