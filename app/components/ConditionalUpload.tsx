'use client'

import { usePathname } from 'next/navigation'
import FileUpload from './FileUpload'

interface ConditionalUploadProps {
  userId?: string
  currentFolderId?: string
  onUploadComplete: () => void
}

export default function ConditionalUpload({ userId, currentFolderId, onUploadComplete }: ConditionalUploadProps) {
  const pathname = usePathname()
  
  // Only show the upload area on the root path or /dashboard
  const shouldShowUpload = pathname === '/' || pathname === '/dashboard'

  if (!shouldShowUpload) {
    return null
  }

  return (
    <div className="mb-6 w-full">
      <FileUpload
        userId={userId}
        currentFolderId={currentFolderId}
        onUploadComplete={onUploadComplete}
      />
    </div>
  )
}