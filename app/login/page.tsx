"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) alert(error.message)
    else router.push("/admin")
    setLoading(false)
  }
  const register = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password: pass })
    if (error) alert(error.message)
    else alert("Revisá tu email para confirmar. Después volvé a loguearte.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#1E293B] grid place-items-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-[380px] shadow-2xl">
        <h1 className="font-black text-xl">Presupuestar - Acceso Dueño</h1>
        <p className="text-sm text-slate-500 mt-1">Entrá para ver tus clientes</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu email" className="mt-6 w-full border rounded-xl px-3 py-3 text-sm outline-none"/>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="contraseña" className="mt-3 w-full border rounded-xl px-3 py-3 text-sm outline-none"/>
        <button onClick={login} disabled={loading} className="mt-4 w-full bg-slate-900 text-white rounded-xl py-3 font-black text-sm">{loading? "..." : "INGRESAR"}</button>
        <button onClick={register} className="mt-2 w-full bg-slate-100 text-slate-700 rounded-xl py-3 font-bold text-sm">Crear cuenta</button>
      </div>
    </div>
  )
}