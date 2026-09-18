"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)

  const handleJoin = async () => {
    if (!email) return alert("Pone tu mail")
    
    const { error } = await supabase.from("waitlist").insert({ email })
    
    if (error) {
      if (error.code === "23505") {
        setDone(true)
        return
      }
      return alert(error.message)
    }
    setDone(true)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-black tracking-tighter mb-2">LACROIX LAB</h1>
      <p className="text-zinc-400 mb-8 tracking-[0.2em] text-sm">EST. RIO CUARTO 2026</p>
      
      {!done ? (
        <div className="flex gap-2 w-full max-w-sm">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu email"
            className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-lg outline-none focus:border-white transition"
          />
          <button onClick={handleJoin} className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-zinc-200 transition">
            JOIN
          </button>
        </div>
      ) : (
        <div className="bg-white text-black px-8 py-4 rounded-full font-bold animate-pulse">
          ¡Ya estás adentro! 🔬
        </div>
      )}
    </main>
  )
}