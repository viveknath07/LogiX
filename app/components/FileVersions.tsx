

'use client'


import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Version {
  id: string
  version_number: number
  created_at: string
  author_id: string
  storage_path: string
}

export default function FileVersions({ fileId }: { fileId: string }) {
  const [versions, setVersions] = useState<Version[]>([])
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (show) fetchVersions()
  }, [show])

  const fetchVersions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('file_versions')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })

    if (error) {
      alert('Error getting versions: ' + error.message)
      setVersions([])
    } else {
      setVersions(data || [])
    }
    setLoading(false)
  }

  const restoreVersion = async (version: Version) => {
    if (!confirm(`Restore to this version?`)) return
    // Save current file as a new version before restoring
    const user = await supabase.auth.getUser()
    const { data: currentFile } = await supabase
      .from('files')
      .select('storage_path')
      .eq('id', fileId)
      .single()

    if (currentFile) {
      await supabase
        .from('file_versions')
        .insert({
          file_id: fileId,
          version_number: versions.length + 1,
          storage_path: currentFile.storage_path,
          author_id: user.data.user?.id,
        })
    }

    const { error } = await supabase
      .from('files')
      .update({ storage_path: version.storage_path, modified_at: new Date() })
      .eq('id', fileId)
    if (error) alert('Restore failed: ' + error.message)
    else {
      alert('Restored!')
      window.location.reload()
    }
  }

  const downloadVersion = async (version: Version) => {
    const { data, error } = await supabase.storage
      .from('files')
      .download(version.storage_path)
    if (error) return alert('Download failed: ' + error.message)
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = `version_${version.version_number}`
    link.click()
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <button className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 text-sm"
        type="button"
        onClick={() => setShow(!show)}>
        📚 Versions
      </button>
      {show && (
        <div className="absolute z-30 bg-white border shadow-lg rounded p-4 min-w-[300px] mt-2">
          <h3 className="font-semibold mb-2">Version History</h3>
          {loading ? <div>Loading...</div>
            : !versions.length ?
              <div>No previous versions</div> :
              versions.map((v) => (
                <div key={v.id} className="flex justify-between items-center border-b py-1">
                  <div>
                    <div>Version {v.version_number}</div>
                    <div className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => restoreVersion(v)}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    >↩️ Restore</button>
                    <button onClick={() => downloadVersion(v)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >⬇️ Download</button>
                  </div>
                </div>
              ))}
          <button className="w-full mt-3 bg-gray-300 rounded px-2 py-1"
            onClick={() => setShow(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  )
}
