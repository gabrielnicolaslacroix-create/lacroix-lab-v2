"use client"

const COLORES = [
  { hex: '#0A2540', name: 'Azul Marino' },
  { hex: '#0F172A', name: 'Negro Premium' },
  { hex: '#1E3A5F', name: 'Azul Acero' },
  { hex: '#991B1B', name: 'Rojo Ladrillo' },
  { hex: '#14532D', name: 'Verde Bosque' },
  { hex: '#27272A', name: 'Grafito' },
];

export default function ColorSelector({ value, onChange }: { value: string, onChange: (c:string)=>void }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {COLORES.map(c => (
        <button
          key={c.hex}
          onClick={() => onChange(c.hex)}
          className={`w-10 h-10 rounded-full border-2 transition-all ${value === c.hex ? 'border-black scale-110 ring-2 ring-offset-2 ring-black' : 'border-white shadow'}`}
          style={{ background: c.hex }}
          title={c.name}
        />
      ))}
    </div>
  )
}