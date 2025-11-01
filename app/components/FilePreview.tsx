'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface FilePreviewProps {
  file: {
    id: string
    name: string
    file_type: string
    size: number
    storage_path: string
    created_at: string
  }
  isOpen: boolean
  onClose: () => void
}

export default function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [textContent, setTextContent] = useState('')

  useEffect(() => {
    if (isOpen && file) {
      loadPreview()
    }
  }, [isOpen, file])

  const loadPreview = async () => {
    setLoading(true)
    setError('')
    setTextContent('')
    
    try {
      // Get public URL for the file
      const { data } = await supabase.storage
        .from('files')
        .getPublicUrl(file.storage_path)

      if (data?.publicUrl) {
        setPreviewUrl(data.publicUrl)
        
        // For text files, load and display content
        if (file.file_type?.startsWith('text/') || file.name.endsWith('.txt')) {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('files')
            .download(file.storage_path)
          
          if (downloadError) throw downloadError
          
          const text = await fileData.text()
          setTextContent(text.slice(0, 5000)) // Limit to first 5000 chars
        }
      }
    } catch (err: any) {
      setError('Unable to preview file: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = () => {
    const type = file.file_type
    if (type?.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📕'
    if (type?.startsWith('video/')) return '🎥'
    if (type?.startsWith('audio/')) return '🎵'
    if (type?.startsWith('text/')) return '📝'
    return '📄'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading preview...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p className="text-xl mb-2">❌</p>
            <p>{error}</p>
            <p className="text-sm text-gray-600 mt-2">Try downloading the file instead</p>
          </div>
        </div>
      )
    }

    const type = file.file_type

    // Image preview
    if (type?.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img 
            src={previewUrl} 
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
            onError={() => setError('Failed to load image')}
          />
        </div>
      )
    }

    // PDF preview using iframe
    if (type === 'application/pdf') {
      return (
        <div className="h-96">
          <iframe
            src={previewUrl}
            className="w-full h-full border rounded-lg"
            title={file.name}
          />
        </div>
      )
    }

    // Video preview
    if (type?.startsWith('video/')) {
      return (
        <div className="flex justify-center">
          <video 
            controls 
            className="max-w-full max-h-96 rounded-lg"
            onError={() => setError('Video format not supported')}
          >
            <source src={previewUrl} type={type} />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    // Audio preview
    if (type?.startsWith('audio/')) {
      return (
        <div className="flex justify-center py-8">
          <div className="w-full max-w-md">
            <audio 
              controls 
              className="w-full"
              onError={() => setError('Audio format not supported')}
            >
              <source src={previewUrl} type={type} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        </div>
      )
    }

    // Text file preview
    if (textContent || type?.startsWith('text/') || file.name.endsWith('.txt')) {
      return (
        <div className="h-96 bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
          <pre className="whitespace-pre-wrap">{textContent || 'Loading text content...'}</pre>
          {textContent.length >= 5000 && (
            <p className="text-gray-500 text-sm mt-2">
              ⚠️ Preview limited to first 5000 characters
            </p>
          )}
        </div>
      )
    }

    // Unsupported file type
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-600">
          <p className="text-4xl mb-4">{getFileIcon()}</p>
          <p className="text-lg font-semibold">Preview not available</p>
          <p className="text-sm mt-2">This file type cannot be previewed in the browser</p>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFileIcon()}</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{file.name}</h2>
              <p className="text-sm text-gray-600">
                {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl p-2"
          >
            ✕
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderPreview()}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {file.file_type || 'Unknown file type'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Download the file
                const link = document.createElement('a')
                link.href = previewUrl
                link.download = file.name
                link.click()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              disabled={!previewUrl}
            >
              📥 Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}