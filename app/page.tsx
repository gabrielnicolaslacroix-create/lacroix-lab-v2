"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"

const COLORS = ["#0A2540", "#1a1a2e", "#2a4b8d", "#c0392b", "#1e7a4c", "#000000"]

export default function Home() {
  const [brandColor, setBrandColor] = useState("#0A2540")
  const [logoUrl, setLogoUrl] = useState("")
  const [logoName, setLogoName] = useState("")
  const [email, setEmail] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoName(file.name)
    console.log("Archivo:", file.name)

    // Preview instantáneo
    const reader = new FileReader()
    reader.onload = (ev) => setLogoUrl(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`
      const { error } = await supabase.storage.from("logos").upload(fileName, file, { contentType: file.type, upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from("logos").getPublicUrl(fileName)
      setLogoUrl(data.publicUrl)
    } catch (err: any) {
      console.error(err)
      // No borramos el preview local, así sigue funcionando
    }
    setUploading(false)
  }

  const handleJoin = async () => {
    if (!email) return alert("Pone tu mail")
    const { error } = await supabase.from("waitlist").insert({ email, brand_color: brandColor, logo_url: logoUrl })
    if (error?.code === '23505') return alert("¡Ya estabas adentro! 😉")
    if (error) return alert(error.message)
    alert("¡Ya estás adentro! 🔬")
  }

  const handlePDF = async () => {
    const doc = new jsPDF()
    doc.setFillColor(brandColor)
    doc.rect(0, 0, 210, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text("Aberturas del Sur", 15, 20)
    doc.setFontSize(10)
    doc.text("Presupuesto para Cliente Demo", 15, 27)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text("Total: $1.250.000", 15, 60)
    doc.setFillColor(brandColor)
    doc.rect(15, 70, 180, 3, 'F')
    doc.save(`Presupuesto-${brandColor}.pdf`)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <p className="text-zinc-400 text-sm mt-10 mb-8">Unite al drop exclusivo.</p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-sm mb-6">
        <p className="text-[10px] tracking-widest text-zinc-500 mb-3">TEST COLOR MARCA (WHITE-LABEL):</p>
        <div className="flex gap-2 mb-4">
          {COLORS.map(c => (
            <button key={c} onClick={() => setBrandColor(c)} className={`w-8 h-8 rounded-full border-2 ${brandColor === c? 'border-white' : 'border-zinc-700'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <input value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-full border border-zinc-800 rounded-md px-3 py-2 text-sm outline-none mb-4" style={{ backgroundColor: brandColor }} />

        <p className="text-[10px] text-zinc-500 mb-2">Logo de la empresa:</p>
        {/* FIX: Un solo input y un solo label */}
        <input
          type="file"
          id="logo-upload"
          hidden
          accept="image/png, image/jpeg, image/webp, image/svg+xml"
          onChange={handleLogoUpload}
        />
        <div className="flex items-center gap-3">
          <label htmlFor="logo-upload" className="bg-white text-black text-xs px-4 py-2 rounded cursor-pointer font-bold hover:bg-zinc-200 transition">
            {uploading? "Subiendo..." : logoUrl? "✓ Cambiar Logo" : "Seleccionar archivo"}
          </label>
          <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">
            {uploading? "subiendo..." : logoName? logoName : "sin archivo"}
          </span>
        </div>
        {logoUrl && <p className="text-[9px] text-green-400 mt-2">✓ {logoName} cargado correctamente</p>}
      </div>

      <div className="flex gap-2 mb-8">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu email" className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded text-sm outline-none w-48" />
        <button onClick={handleJoin} className="bg-white text-black px-5 py-2 rounded text-sm font-bold">JOIN</button>
      </div>

      <div className="w-full max-w-lg bg-white rounded-lg overflow-hidden text-black mb-6">
        <div className="p-5 flex justify-between items-center text-white" style={{ backgroundColor: brandColor }}>
          <div><h2 className="font-bold text-lg">Aberturas del Sur</h2><p className="text-[11px] opacity-80">Presupuesto para Cliente Demo</p></div>
          {logoUrl? <img src={logoUrl} alt="logo" className="w-12 h-12 bg-white rounded object-contain p-1" /> : <div className="w-10 h-10 bg-white/20 rounded" />}
        </div>
        <div className="p-6"><div className="flex justify-between"><span className="text-xs text-zinc-600">Total</span><span className="font-bold">$1.250.000</span></div><div className="h-2 rounded-full mt-6" style={{ backgroundColor: brandColor }} /></div>
      </div>

      <button onClick={handlePDF} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition">
        Descargar Presupuesto PDF 📄
      </button>
    </main>
  )
}