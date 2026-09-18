"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

const COLORS = ["#0A2540", "#1a1a2e", "#2a4b8d", "#c0392b", "#1e7a4c", "#000000"]

export default function Home() {
  const [brandColor, setBrandColor] = useState("#0A2540")
  const [logoUrl, setLogoUrl] = useState("")
  const [email, setEmail] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("logos").upload(fileName, file)
    if (error) { alert(error.message); setUploading(false); return }
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName)
    setLogoUrl(data.publicUrl)
    setUploading(false)
  }

  const handleJoin = async () => {
    if (!email) return alert("Pone tu mail")
    const { error } = await supabase.from("waitlist").insert({
      email,
      brand_color: brandColor,
      logo_url: logoUrl
    })
    if (error) {
      if (error.code === '23505') return alert("¡Ya estabas adentro! 😉")
      return alert(error.message)
    }
    alert("¡Ya estás adentro! Te avisamos del drop exclusivo 🔬")
    setEmail("")
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <p className="text-zinc-400 text-sm mt-10 mb-8">Unite al drop exclusivo.</p>

      {/* TESTER WHITE LABEL */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-sm mb-6">
        <p className="text-[10px] tracking-widest text-zinc-500 mb-3">TEST COLOR MARCA (WHITE-LABEL):</p>

        <div className="flex gap-2 mb-4">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setBrandColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${brandColor === c? 'border-white' : 'border-zinc-700'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <input
          value={brandColor}
          onChange={e => setBrandColor(e.target.value)}
          className="w-full bg-[#0A2540] border border-zinc-800 rounded-md px-3 py-2 text-sm outline-none mb-2"
          style={{ backgroundColor: brandColor }}
          placeholder="#0A2540"
        />
        <p className="text-[10px] text-zinc-600 mb-4">{brandColor}</p>

        <p className="text-[10px] text-zinc-500 mb-2">Logo de la empresa:</p>
        <div className="flex items-center gap-2">
          <label className="bg-white text-black text-xs px-3 py-1.5 rounded cursor-pointer font-bold">
            Seleccionar archivo
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </label>
          <span className="text-[10px] text-zinc-500">{uploading? "subiendo..." : "logo jpeg"}</span>
        </div>
        {logoUrl && <p className="text-[9px] text-green-400 mt-2 truncate">Logo: {logoUrl}</p>}
      </div>

      {/* JOIN */}
      <div className="flex gap-2 mb-12">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu email"
          className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded text-sm outline-none w-48"
        />
        <button onClick={handleJoin} className="bg-white text-black px-5 py-2 rounded text-sm font-bold">JOIN</button>
      </div>

      {/* PREVIEW PRESUPUESTO */}
      <div className="w-full max-w-lg bg-white rounded-lg overflow-hidden text-black">
        <div className="p-5 flex justify-between items-center text-white" style={{ backgroundColor: brandColor }}>
          <div>
            <h2 className="font-bold text-lg">Aberturas del Sur</h2>
            <p className="text-[11px] opacity-80">Presupuesto para Cliente Demo</p>
          </div>
          {logoUrl? (
            <img src={logoUrl} alt="logo" className="w-10 h-10 bg-white rounded object-contain p-1" />
          ) : (
            <div className="w-10 h-10 bg-white rounded" />
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-600">Total</span>
            <span className="font-bold">$1.250.000</span>
          </div>
          <div className="h-2 rounded-full mt-6" style={{ backgroundColor: brandColor }} />
          <p className="text-[9px] text-zinc-400 mt-4">Generado por LACROIX LAB - Sistema White Label</p>
        </div>
      </div>
    </main>
  )
}