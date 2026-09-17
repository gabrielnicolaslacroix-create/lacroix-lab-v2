"use client"
import { supabase } from "../../lib/supabase"

export default function LogoUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const upload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("logos").upload(fileName, file)
    if (error) { alert(error.message); return }
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName)
    onUpload(data.publicUrl)
  }
  return (
    <div className="mt-4">
      <label className="text-xs text-zinc-400">Logo de la empresa:</label>
      <input type="file" onChange={upload} className="mt-1 block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white file:text-black" />
    </div>
  )
}