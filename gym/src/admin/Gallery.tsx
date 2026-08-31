import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface GalleryPhoto {
  id: string
  image_url: string
  caption: string | null
  is_featured: boolean
  is_active: boolean
  sort_order: number
}

export default function Gallery() {
  const [rows, setRows] = useState<GalleryPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('gallery_photos').select('*').order('sort_order')
    if (data) setRows(data as GalleryPhoto[])
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
      const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file)
      if (uploadError) {
        setError(`Upload failed for ${file.name}: ${uploadError.message}. Make sure a public "gallery" bucket exists in Supabase Storage.`)
        continue
      }
      const { data: publicUrl } = supabase.storage.from('gallery').getPublicUrl(path)
      await supabase.from('gallery_photos').insert({
        image_url: publicUrl.publicUrl,
        sort_order: rows.length,
      })
    }

    setUploading(false)
    if (fileInput.current) fileInput.current.value = ''
    load()
  }

  async function toggleActive(id: string, value: boolean) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, is_active: value } : x)))
    await supabase.from('gallery_photos').update({ is_active: value }).eq('id', id)
  }

  async function setFeatured(id: string) {
    await supabase.from('gallery_photos').update({ is_featured: false }).neq('id', id)
    await supabase.from('gallery_photos').update({ is_featured: true }).eq('id', id)
    load()
  }

  async function updateCaption(id: string, caption: string) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, caption } : x)))
    await supabase.from('gallery_photos').update({ caption }).eq('id', id)
  }

  async function remove(id: string, imageUrl: string) {
    await supabase.from('gallery_photos').delete().eq('id', id)
    const path = imageUrl.split('/gallery/')[1]
    if (path) await supabase.storage.from('gallery').remove([path])
    load()
  }

  return (
    <div>
      <h1 className="text-2xl text-white">Gallery</h1>

      <div className="mt-4">
        <label className="inline-block cursor-pointer rounded-full bg-volt px-5 py-2.5 text-sm font-semibold text-white">
          {uploading ? 'Uploading…' : 'Upload Photos'}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((p) => (
          <div key={p.id} className="rounded-xl border border-line bg-panel p-3">
            <img src={p.image_url} alt={p.caption || 'Gallery photo'} className="h-32 w-full rounded-lg object-cover" />
            <input
              placeholder="Caption (optional)"
              value={p.caption || ''}
              onChange={(e) => updateCaption(p.id, e.target.value)}
              className="input mt-2 py-1.5 text-xs"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <label className="flex items-center gap-1 text-steel">
                <input type="checkbox" checked={p.is_active} onChange={(e) => toggleActive(p.id, e.target.checked)} />
                Active
              </label>
              <button onClick={() => setFeatured(p.id)} className={p.is_featured ? 'text-volt' : 'text-steel underline'}>
                {p.is_featured ? 'Featured' : 'Set featured'}
              </button>
            </div>
            <button onClick={() => remove(p.id, p.image_url)} className="mt-2 w-full text-center text-xs text-red-400 underline">
              Delete
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="col-span-full text-steel">No photos uploaded yet.</p>}
      </div>
    </div>
  )
}
