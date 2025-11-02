'use client'

import React from 'react'
import Header from '../../components/Header'

export default function FilesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header onSearch={() => {}} />
      {children}
    </div>
  )
}