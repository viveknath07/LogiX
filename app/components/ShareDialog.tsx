'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface ShareDialogProps {
  fileId: string
  fileName: string
  isOpen: boolean
  onClose: () => void
  onShareSuccess: () => void
}

export default function ShareDialog({ fileId, fileName, isOpen, onClose, onShareSuccess }: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Get current user
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) {
        setMessage('Error: Not logged in')
        return
      }

      // Find user by email
      const { data: targetUsers, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)

      if (userError) throw userError

      if (!targetUsers || targetUsers.length === 0) {
        setMessage('User not found. Make sure they have an account.')
        return
      }

      const targetUserId = targetUsers[0].id

      // Check if already shared
      const { data: existingShares } = await supabase
        .from('shares')
        .select()
        .eq('file_id', fileId)
        .eq('shared_with_user_id', targetUserId)

      if (existingShares && existingShares.length > 0) {
        setMessage('File already shared with this user')
        return
      }

      // Create share
      const { error: shareError } = await supabase
        .from('shares')
        .insert({
          file_id: fileId,
          shared_with_user_id: targetUserId,
          shared_by_user_id: currentUser.user.id,
          permission: permission
        })

      if (shareError) throw shareError

      setMessage('✅ File shared successfully!')
      setEmail('')
      onShareSuccess()
      setTimeout(() => {
        onClose()
        setMessage('')
      }, 2000)

    } catch (error: any) {
      setMessage('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Share "{fileName}"</h2>
        
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with (email):
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user's email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission:
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </select>
          </div>

          {message && (
            <div className={`p-3 rounded ${
              message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sharing...' : 'Share File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}