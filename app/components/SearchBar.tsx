'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilter: (filter: string) => void
  onSort: (sort: string) => void
}

export default function SearchBar({ onSearch, onFilter, onSort }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedSort, setSelectedSort] = useState('newest')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    onFilter(filter)
  }

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort)
    onSort(sort)
  }

  const fileTypes = [
    { value: 'all', label: 'All Files', icon: '📁' },
    { value: 'image', label: 'Images', icon: '🖼️' },
    { value: 'document', label: 'Documents', icon: '📄' },
    { value: 'pdf', label: 'PDFs', icon: '📕' },
    { value: 'video', label: 'Videos', icon: '🎥' },
    { value: 'audio', label: 'Audio', icon: '🎵' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'size-asc', label: 'Size (Small to Large)' },
    { value: 'size-desc', label: 'Size (Large to Small)' },
  ]

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search files by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                onSearch('')
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* File Type Filters */}
        <div className="flex flex-wrap gap-2">
          {fileTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleFilterChange(type.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedFilter === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Sort by:</span>
          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-4 text-sm text-gray-600">
          <button
            onClick={() => handleFilterChange('recent')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <span>🕐</span>
            Recent
          </button>
          <button
            onClick={() => handleFilterChange('favorites')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <span>⭐</span>
            Favorites
          </button>
          <button
            onClick={() => handleFilterChange('large')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <span>💾</span>
            Large Files
          </button>
        </div>
      </div>
    </div>
  )
}