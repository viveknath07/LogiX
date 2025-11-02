'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ThemeToggle from './ThemeToggle'
import {
  Search,
  Upload,
  FolderPlus,
  Settings,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Plus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  onSearch?: (query: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <header className="h-14 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">☁️ LogiX</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium"
              onClick={() => handleNavigation('/dashboard/files')}
            >
              Files
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium"
              onClick={() => handleNavigation('/dashboard/photos')}
            >
              Photos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium"
              onClick={() => handleNavigation('/dashboard/shared')}
            >
              Shared
            </Button>
          </nav>
        </div>

        <div className="flex-1 max-w-xl px-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search files and folders"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-9 bg-gray-50 border-gray-200 focus:bg-white dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="space-x-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleNavigation('/dashboard/upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation('/dashboard/folder/new')}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Text document
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo album
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}