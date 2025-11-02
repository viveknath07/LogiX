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
    { value: 'all', label: 'All Files', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2z' },
    { value: 'image', label: 'Images', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { value: 'document', label: 'Documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { value: 'pdf', label: 'PDFs', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { value: 'video', label: 'Videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { value: 'audio', label: 'Audio', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'size-asc', label: 'Size (Small to Large)' },
    { value: 'size-desc', label: 'Size (Large to Small)' },
  ]

  const quickFilters = [
    { value: 'recent', label: 'Recent', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'favorites', label: 'Favorites', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { value: 'large', label: 'Large Files', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ]

  return (
    <div className="space-y-4 bg-[#f5f6f7] dark:bg-gray-900 p-4 rounded-lg">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-gray-200 rounded-md focus:border-gray-300 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:focus:border-gray-600"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('')
              onSearch('')
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* File Type Filters */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        {fileTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleFilterChange(type.value)}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === type.value
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={type.icon} />
            </svg>
            {type.label}
          </button>
        ))}
      </div>

      {/* Bottom Row: Quick Filters and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {quickFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`inline-flex items-center text-sm font-medium transition-colors ${
                selectedFilter === filter.value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={filter.icon} />
              </svg>
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</label>
          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-9 pl-3 pr-8 text-sm bg-transparent border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}