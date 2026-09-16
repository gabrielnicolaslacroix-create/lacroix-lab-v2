"use client"
import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from("waitlist").insert([{ email }])
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
      <p className="mb-8 text-zinc-400">Unite al drop exclusivo.</p>
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