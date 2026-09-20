"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Admin() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push("/login")
      setUser(user)
      const { data } = await supabase.from("empresas").select("*").order("created_at", {ascending: false})
      if (data) setEmpresas(data)
    }
    load()
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push("/login") }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex justify-between items-center bg-[#1e293b] p-5 rounded-2xl border border-slate-700">
          <div><h1 className="font-black text-lg text-white">Panel Dueño - Presupuestar</h1><p className="text-xs text-slate-400">{user?.email}</p></div>
          <button onClick={logout} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black">Salir</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#1e293b] border border-slate-700 p-5 rounded-2xl"><p className="text-xs text-slate-400">Total Empresas</p><p className="font-black text-3xl text-white mt-1">{empresas.length}</p></div>
          <div className="bg-[#1e293b] border border-slate-700 p-5 rounded-2xl"><p className="text-xs text-slate-400">En Trial</p><p className="font-black text-3xl text-yellow-400 mt-1">{empresas.filter(e=>e.plan==='trial').length}</p></div>
          <div className="bg-[#1e293b] border border-slate-700 p-5 rounded-2xl"><p className="text-xs text-slate-400">Pagando Pro</p><p className="font-black text-3xl text-emerald-400 mt-1">{empresas.filter(e=>e.plan==='pro').length}</p></div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 mt-6 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between"><h2 className="font-bold text-sm text-white">Empresas registradas</h2><span className="text-[10px] bg-emerald-500 text-black px-2 py-1 rounded-full font-black">LIVE</span></div>
          <div className="divide-y divide-slate-800">
            {empresas.length===0 && <p className="p-8 text-sm text-slate-500 text-center">Todavía no hay empresas.</p>}
            {empresas.map(emp => (
              <div key={emp.id} className="p-4 flex justify-between items-center text-sm">
                <div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-full border border-slate-600" style={{backgroundColor: emp.brand_color || emp.color_primario || '#0A2540'}}/><div><p className="font-bold text-white">{emp.nombre || 'Sin nombre'}</p><p className="text-xs text-slate-400">{emp.email}</p></div></div>
                <div className="text-right"><span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white text-black">{emp.plan?.toUpperCase() || 'TRIAL'}</span><p className="text-[10px] text-slate-500 mt-1">{emp.created_at? new Date(emp.created_at).toLocaleDateString() : ''}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}