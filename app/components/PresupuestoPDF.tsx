"use client"

type Props = {
  empresa: {
    nombre: string
    color_primario: string
    logo_url?: string
  }
  cliente: string
  total: number
}

export default function PresupuestoPDF({ empresa, cliente, total }: Props) {
  return (
    <div className="w-[800px] bg-white text-black p-0 overflow-hidden rounded-xl shadow-2xl border">
      {/* HEADER - ACÁ VA EL COLOR WHITE-LABEL */}
      <div
        className="p-8 text-white flex justify-between items-center"
        style={{ background: empresa.color_primario }}
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight">{empresa.nombre}</h1>
          <p className="text-sm opacity-80 mt-1">Presupuesto para {cliente}</p>
        </div>
        {empresa.logo_url? (
          <img src={empresa.logo_url} alt="logo" className="h-12 w-12 object-contain bg-white rounded p-1" />
        ) : (
          <div className="h-12 w-12 bg-white/20 rounded flex items-center justify-center font-bold">
            {empresa.nombre[0]}
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-8">
        <div className="flex justify-between border-b pb-4 mb-6">
          <span className="text-zinc-500">Total</span>
          <span className="text-2xl font-bold">${total.toLocaleString('es-AR')}</span>
        </div>
        <div className="h-2 w-full rounded" style={{ background: empresa.color_primario }}></div>
        <p className="text-xs text-zinc-400 mt-6">Generado por LACROIX LAB - Sistema White-Label</p>
      </div>
    </div>
  )
}