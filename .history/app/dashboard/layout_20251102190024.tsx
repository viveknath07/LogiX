'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
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
  }

  const getStorageInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('files')
        .select('size')
        .eq('user_id', user.id)
        .eq('is_deleted', false)

      if (error) throw error

      const totalUsed = data?.reduce((sum, file) => sum + (file.size || 0), 0) || 0
      setStorageUsed(totalUsed)
    } catch (error) {
      console.error('Error getting storage info:', error)
    }
  }

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
          {children}
        </main>
      </div>
    </div>
  )
}