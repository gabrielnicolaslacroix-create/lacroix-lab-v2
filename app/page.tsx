"use client"
import { useState } from "react"
import { supabase } from "../lib/supabase"
import ColorSelector from "./components/ColorSelector"

export default function Home() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [color, setColor] = useState('#0A2540')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from("waitlist").insert([{ email, color_primario: color }])
    setLoading(false)
    if (!error) {
      setDone(true)
      setEmail("")
    } else {
      alert("Error: " + error.message)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-4">LACROIX LAB</h1>
      <p className="mb-2 text-zinc-400">Unite al drop exclusivo.</p>
      
      {/* TEST WHITE-LABEL - después lo movemos al dashboard */}
      <div className="my-8 p-6 rounded-xl bg-zinc-900 border border-zinc-800 w-full max-w-sm">
        <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">Test color marca (white-label):</p>
        <ColorSelector value={color} onChange={setColor} />
        <div className="mt-4 h-12 rounded-lg border border-zinc-700 transition-colors" style={{ background: color }}></div>
        <p className="mt-2 text-xs text-zinc-500">{color}</p>
      </div>

      {done ? (
        <p className="text-green-400 text-xl">¡Ya estás adentro! 🔥</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-white"
          />
          <button
            disabled={loading}
            className="px-6 py-2 bg-white text-black rounded font-bold hover:bg-zinc-200"
          >
            {loading ? "..." : "JOIN"}
          </button>
        </form>
      )}
    </main>
  )
}