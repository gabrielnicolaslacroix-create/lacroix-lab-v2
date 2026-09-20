"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"

const BASE_COLORS = ["#0A2540", "#1a1a2e", "#2a4b8d", "#c0392b", "#1e7a4c", "#000000"]
type Item = { id: string, desc: string, detalle: string, cant: string, unit: number }
type Maqueta = { id: string, nombre: string, empresa: string, brandColor: string, tinte: 'claro'|'original'|'oscuro', logoUrl: string, aliasMp: string, emailEmpresa: string, observaciones: string, titular: string, cuit: string }

export default function Home() {
  const [empresa, setEmpresa] = useState("Aberturas del Sur")
  const [brandColor, setBrandColor] = useState("#0A2540")
  const [tinte, setTinte] = useState<'claro'|'original'|'oscuro'>('original')
  const [logoUrl, setLogoUrl] = useState("")
  const [logoName, setLogoName] = useState("")
  const [aliasMp, setAliasMp] = useState("aberturasdelsur.mp")
  const [emailEmpresa, setEmailEmpresa] = useState("info@aberturasdelsur.com")
  const [telefono, setTelefono] = useState("+54 9 221 456-7890")
  const [titular, setTitular] = useState("Aberturas del Sur S.R.L.")
  const [cuit, setCuit] = useState("30-71856492-1")
  const [descuento, setDescuento] = useState(0)
  const [nroPresu] = useState("AB-2026-0142")
  const [uploading, setUploading] = useState(false)
  const [cliente, setCliente] = useState("Constructora Nova Urbana S.A.")
  const [clienteCuit, setClienteCuit] = useState("30-71234567-9")
  const [clienteContacto, setClienteContacto] = useState("Arq. Martín López - 221 555-0123")
  const [proyecto, setProyecto] = useState("Gran Fachada Comercial de Vidrio — Centro")
  const [direccion, setDireccion] = useState("Av. 44 Nº 1234, La Plata, Buenos Aires, Argentina")
  const [observaciones, setObservaciones] = useState("• Material: Vidrio templado de seguridad 10mm certificado.\n• Plazo de ejecución: 20 a 25 días hábiles desde el pago del anticipo.\n• El presupuesto incluye transporte e instalación en sitio.\n• Precio en pesos argentinos, no incluye IVA.")
  const [maquetas, setMaquetas] = useState<Maqueta[]>([])
  const [nombreMaqueta, setNombreMaqueta] = useState("")
  const [items, setItems] = useState<Item[]>([
    { id: "1", desc: "Cristal templado 10mm", detalle: "Fachada comercial laminada, 40 m²", cant: "40", unit: 25000 },
    { id: "2", desc: "Estructura de aluminio anodizado", detalle: "Perfiles línea pesada, 40 ml", cant: "40", unit: 18000 },
    { id: "3", desc: "Instalación y mano de obra especializada", detalle: "Montaje y colocación", cant: "1", unit: 245000 },
    { id: "4", desc: "Herrajes, sellados y silicona estructural", detalle: "Kit completo", cant: "1", unit: 85000 },
  ])

  const totalReal = items.reduce((acc, it) => acc + (it.unit * (parseFloat(it.cant) || 1)), 0)
  const totalConDesc = totalReal - (totalReal * descuento / 100)
  const calcHojas = () => { if (items.length <= 10) return 1; return 1 + Math.ceil((items.length - 10) / 14) }
  const hojas = calcHojas()
  const getFinalRgb = (hex: string) => {
    let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    if (tinte === 'claro') { r = Math.min(255, r+50); g = Math.min(255, g+50); b = Math.min(255, b+50) }
    if (tinte === 'oscuro') { r = Math.max(0, r-35); g = Math.max(0, g-35); b = Math.max(0, b-35) }
    return { r, g, b, css: `rgb(${r},${g},${b})` }
  }
  const final = getFinalRgb(brandColor)

  useEffect(() => { const saved = localStorage.getItem("presupuestar_maquetas"); if (saved) setMaquetas(JSON.parse(saved)) }, [])
  const guardarMaqueta = () => { if (!nombreMaqueta) return alert("Ponele un nombre"); const nueva: Maqueta = { id: Date.now().toString(), nombre: nombreMaqueta, empresa, brandColor, tinte, logoUrl, aliasMp, emailEmpresa, observaciones, titular, cuit }; const nuevas = [...maquetas, nueva]; setMaquetas(nuevas); localStorage.setItem("presupuestar_maquetas", JSON.stringify(nuevas)); setNombreMaqueta("") }
  const cargarMaqueta = (m: Maqueta) => { setEmpresa(m.empresa); setBrandColor(m.brandColor); setTinte(m.tinte || 'original'); setLogoUrl(m.logoUrl); setAliasMp(m.aliasMp); setEmailEmpresa(m.emailEmpresa); setObservaciones(m.observaciones || observaciones); setTitular(m.titular || titular); setCuit(m.cuit || cuit) }
  const borrarMaqueta = (id: string) => { const nuevas = maquetas.filter(m => m.id!== id); setMaquetas(nuevas); localStorage.setItem("presupuestar_maquetas", JSON.stringify(nuevas)) }
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setLogoName(file.name); const reader = new FileReader(); reader.onload = (ev) => setLogoUrl(ev.target?.result as string); reader.readAsDataURL(file); setUploading(true)
    try { const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`; const { error } = await supabase.storage.from("logos").upload(fileName, file, { upsert: true }); if (!error) { const { data } = supabase.storage.from("logos").getPublicUrl(fileName); setLogoUrl(data.publicUrl) } } catch {} setUploading(false)
  }

  const downloadPDF = async () => {
    const doc = new jsPDF({format: 'a4'}); const { r, g, b } = final
    const addPageFrame = () => { doc.setFillColor(232,236,241); doc.rect(0, 0, 210, 297, 'F'); doc.setDrawColor(200,205,215); doc.setLineWidth(0.2); doc.rect(4.5, 4.5, 201, 288, 'D'); doc.setDrawColor(r,g,b); doc.setLineWidth(0.6); doc.rect(6, 6, 198, 285, 'D') }
    const addHeader = (pageNum: number) => {
      doc.setFillColor(r,g,b); doc.roundedRect(8,8,194,22,3,3,'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.text(empresa.substring(0,28), 14, 17)
      doc.setFontSize(4.8); doc.setFont('helvetica','normal'); doc.setTextColor(200,210,225); doc.text(`${cuit} • ${telefono} • ${emailEmpresa}`, 14, 21)
      if (logoUrl) { try { doc.setFillColor(255,255,255); doc.roundedRect(85, 9, 17, 17, 3, 3, 'F'); const isPng = logoUrl.toLowerCase().includes('png') || logoUrl.startsWith('data:image/png'); doc.addImage(logoUrl, isPng? 'PNG' : 'JPEG', 86.5, 10.5, 14, 14, undefined, 'FAST') } catch {} }
      doc.setFontSize(6); doc.setFillColor(255,255,255); doc.roundedRect(130, 9.5, 54, 5.5, 3, 3, 'F'); doc.setTextColor(r,g,b); doc.setFont('helvetica','bold'); doc.text("PRESUPUESTO / COTIZACION", 132, 13)
      doc.setTextColor(255,255,255); doc.setFontSize(4.8); doc.setFont('helvetica','normal'); doc.text(`${nroPresu} • Hoja ${pageNum} de ${hojas}`, 132, 21)
      doc.setFillColor(34,197,94); doc.roundedRect(178, 9.5, 18, 5.5, 2, 2, 'F'); doc.setTextColor(255,255,255); doc.setFontSize(4.2); doc.text("VIGENTE", 187, 13, {align:'center'})
    }
    const addFooter = () => {
      doc.setDrawColor(r,g,b); doc.setLineWidth(0.6); doc.line(14, 263, 196, 263)
      doc.setFillColor(255,255,255); doc.setDrawColor(220,225,232); doc.roundedRect(14, 265, 182, 9, 2, 2, 'FD')
      doc.setTextColor(80,80,80); doc.setFontSize(5); doc.text(`${empresa} • ${emailEmpresa} • ${telefono} • Verificar: ${nroPresu}`, 105, 270.5, {align:'center'})
    }
    let pageNum = 1; addPageFrame(); addHeader(pageNum); let y = 33

    // --- BLOQUE COMPACTO NUEVO (ANTES 38px, AHORA 26px) ---
    doc.setFillColor(255,255,255); doc.setDrawColor(220,225,232); doc.roundedRect(10, y, 190, 16, 3, 3, 'FD')
    doc.setTextColor(140,145,155); doc.setFont('helvetica','bold'); doc.setFontSize(4.2);
    doc.text("CLIENTE:", 13, y+4); doc.text("CUIT/CONTACTO:", 55, y+4); doc.text("PROYECTO / OBRA:", 105, y+4); doc.text("DETALLES:", 160, y+4)
    doc.setDrawColor(235,238,242); doc.line(13, y+5.5, 187, y+5.5)
    doc.setFont('helvetica','bold'); doc.setFontSize(5.4); doc.setTextColor(15,23,42); doc.text(cliente.substring(0,32), 13, y+9)
    doc.setFont('helvetica','normal'); doc.setFontSize(4.6); doc.setTextColor(50,50,55); doc.text(`${clienteCuit} • ${clienteContacto.substring(0,28)}`, 55, y+9)
    doc.text(`${proyecto.substring(0,38)}`, 105, y+9); doc.setTextColor(100,100,105); doc.setFontSize(4.4); doc.text(`${direccion.substring(0,32)}`, 105, y+12)
    doc.setFont('helvetica','bold'); doc.setFontSize(4.8); doc.setTextColor(15,23,42); doc.text(`${nroPresu} • ${new Date().toLocaleDateString()}`, 160, y+9)
    doc.setFillColor(220,252,231); doc.setDrawColor(187,247,208); doc.roundedRect(160, y+10.5, 24, 3.5, 2, 2, 'FD'); doc.setFontSize(3.8); doc.setTextColor(22,101,52); doc.text("● VIGENTE", 162, y+12.8)
    y += 19

    doc.setFillColor(241,245,249); doc.setDrawColor(220,225,232); doc.roundedRect(10, y, 190, 7, 2, 2, 'FD')
    doc.setTextColor(60,70,85); doc.setFont('helvetica','bold'); doc.setFontSize(5.5); doc.text("DETALLE DEL PROYECTO", 13, y+4.5)
    doc.setFontSize(4.3); doc.setTextColor(100,110,125); doc.text(`${items.length} items • ${nroPresu}`, 170, y+4.5)
    y += 9.5
    doc.setFillColor(r,g,b); doc.roundedRect(10, y, 190, 7, 2, 2, 'F'); doc.setTextColor(255,255,255); doc.setFontSize(5); doc.setFont('helvetica','bold')
    doc.text("DESCRIPCIÓN", 13, y+4.5); doc.text("CANTIDAD", 90, y+4.5, {align:'center'}); doc.text("PRECIO UNITARIO", 128, y+4.5, {align:'center'}); doc.text("SUBTOTAL", 176, y+4.5, {align:'center'}); y += 9
    for (let i = 0; i < items.length; i++) {
      if (y > 168) { pageNum++; doc.addPage('a4'); addPageFrame(); addHeader(pageNum); addFooter(); y = 33; doc.setFillColor(r,g,b); doc.roundedRect(10, y, 190, 7, 2, 2, 'F'); doc.setTextColor(255,255,255); doc.setFontSize(5); doc.text("DETALLE (cont.)", 13, y+4.5); y += 10 }
      doc.setFillColor(255,255,255); doc.setDrawColor(235,238,242); doc.roundedRect(10, y-1, 190, 10, 2, 2, 'FD')
      if (i % 2 === 1) { doc.setFillColor(248,250,252); doc.roundedRect(10, y-1, 190, 10, 2, 2, 'F') }
      doc.setTextColor(15,23,42); doc.setFont('helvetica','bold'); doc.setFontSize(5.2); doc.text(items[i].desc.substring(0,52), 13, y+2.8)
      doc.setFont('helvetica','normal'); doc.setFontSize(4.2); doc.setTextColor(120,125,135); doc.text(items[i].detalle.substring(0,56), 13, y+6)
      doc.setTextColor(30,30,35); doc.setFontSize(5); doc.setFont('helvetica','bold'); doc.text(items[i].cant, 90, y+4.2, {align:'center'})
      doc.setFont('helvetica','normal'); doc.text(`$${items[i].unit.toLocaleString('es-AR')}`, 128, y+4.2, {align:'center'})
      const sub = items[i].unit * (parseFloat(items[i].cant)||1); doc.setFont('helvetica','bold'); doc.text(`$${sub.toLocaleString('es-AR')}`, 188, y+4.2, {align:'right'}); y += 11.5
    }
    const espacioNecesario = 88
    if (y + espacioNecesario > 263) {
      pageNum++; doc.addPage('a4'); addPageFrame(); addHeader(pageNum); addFooter(); y = 33
    } else {
      y = Math.max(y + 3, 162)
    }
    doc.setFillColor(255,255,255); doc.setDrawColor(220,225,232); doc.roundedRect(120, y, 80, 23, 3, 3, 'FD')
    doc.setTextColor(100,110,125); doc.setFontSize(5); doc.setFont('helvetica','normal'); doc.text("Subtotal:", 123, y+5.5); doc.text(`$${totalReal.toLocaleString('es-AR')}`, 196, y+5.5, {align:'right'})
    if(descuento > 0){ doc.text(`Descuento ${descuento}%:`, 123, y+10); doc.text(`-$${(totalReal*descuento/100).toLocaleString('es-AR')}`, 196, y+10, {align:'right'}) }
    doc.text("IVA (0%):", 123, y+14.5); doc.text("$0", 196, y+14.5, {align:'right'})
    y += 18; doc.setFillColor(r,g,b); doc.roundedRect(120, y, 80, 10, 3, 3, 'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.text(`TOTAL: $${totalConDesc.toLocaleString('es-AR')}`, 123, y+6.5)
    y += 13; doc.setFillColor(255,255,255); doc.setDrawColor(220,225,232); doc.roundedRect(10, y, 88, 28, 3, 3, 'FD')
    doc.setTextColor(15,23,42); doc.setFontSize(5); doc.setFont('helvetica','bold'); doc.text("ⓘ Observaciones y Condiciones:", 13, y+5.5)
    doc.setDrawColor(235,238,242); doc.line(13, y+7.5, 92, y+7.5); doc.setFontSize(4.6); doc.setFont('helvetica','normal'); doc.setTextColor(70,75,85)
    const obsLines = doc.splitTextToSize(observaciones, 80); doc.text(obsLines.slice(0,5), 13, y+11)
    doc.setFillColor(255,255,255); doc.setDrawColor(200,210,235); doc.roundedRect(106, y, 94, 28, 3, 3, 'FD')
    doc.setTextColor(r,g,b); doc.setFont('helvetica','bold'); doc.setFontSize(5); doc.text("DATOS DE PAGO • VERIFICACIÓN", 109, y+5.5)
    doc.setDrawColor(230,235,242); doc.line(109, y+7.5, 196, y+7.5); doc.setTextColor(20,25,35); doc.setFontSize(5); doc.text(`ALIAS: ${aliasMp}`, 109, y+11)
    doc.setFontSize(4.5); doc.setTextColor(90,95,105); doc.text(`Titular: ${titular}`, 109, y+15.5); doc.text(`CUIT: ${cuit}`, 109, y+19); doc.text(`Cod: ${nroPresu}`, 109, y+22.5)
    doc.setFillColor(248,250,252); doc.setDrawColor(220,225,232); doc.roundedRect(170, y+9, 22, 15, 2, 2, 'FD'); doc.setTextColor(80,85,95); doc.setFontSize(3.8); doc.setFont('helvetica','bold'); doc.text("QR VERIFICAR", 181, y+15, {align:'center'}); doc.setFontSize(3.5); doc.text(nroPresu, 181, y+18.5, {align:'center'})
    y += 31; doc.setDrawColor(180,185,195); doc.setLineWidth(0.25); doc.line(13, y, 88, y); doc.setTextColor(60,65,75); doc.setFontSize(4.6); doc.text("Firma y aclaración - Aberturas del Sur", 13, y+3.5); doc.setTextColor(140,145,155); doc.setFontSize(4.2); doc.text(`${titular} • ${cuit}`, 13, y+7)
    doc.setDrawColor(180,185,195); doc.line(109, y, 196, y); doc.setTextColor(60,65,75); doc.setFontSize(4.6); doc.text("Firma y aclaración - Cliente (Aceptación)", 109, y+3.5); doc.setTextColor(140,145,155); doc.setFontSize(4.2); doc.text("Acepto condiciones y precios detallados", 109, y+7)
    addFooter(); doc.save(`Presupuesto-${nroPresu}-${empresa}.pdf`)
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#b8c0cc]">
      <div className="w-full lg:w-[420px] bg-[#1E293B] p-4 sm:p-6 space-y-5 lg:h-screen lg:overflow-y-auto lg:sticky lg:top-0 text-white order-2 lg:order-1">
        <h2 className="font-black text-[12px] tracking-widest">1. TU MARCA + COLOR</h2>
        <div className="space-y-3">
          <input value={empresa} onChange={e=>setEmpresa(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white outline-none" placeholder="Nombre empresa"/>
          <div className="grid grid-cols-2 gap-2">
            <input value={cuit} onChange={e=>setCuit(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-[12px] text-white outline-none" placeholder="CUIT"/>
            <input value={telefono} onChange={e=>setTelefono(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-[12px] text-white outline-none" placeholder="Teléfono"/>
          </div>
          <div className="flex gap-2.5 p-3 bg-slate-800 rounded-xl border border-slate-600">
            {BASE_COLORS.map(c => <button key={c} onClick={()=>setBrandColor(c)} className={`w-9 h-9 rounded-full border-2 ${brandColor===c?'border-white scale-110':'border-transparent'}`} style={{backgroundColor:c}} />)}
            <label className="w-9 h-9 rounded-full border-2 border-dashed border-slate-400 grid place-items-center cursor-pointer bg-slate-700 text-[11px] font-bold">+<input type="color" value={brandColor} onChange={e=>setBrandColor(e.target.value)} className="hidden" /></label>
          </div>
          <div className="flex gap-2">{(['claro','original','oscuro'] as const).map(t => (<button key={t} onClick={()=>setTinte(t)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border ${tinte===t?'bg-white text-black border-white':'bg-slate-800 text-slate-300 border-slate-600'}`}>{t.toUpperCase()}</button>))}</div>
          <div className="h-4 rounded-full border border-slate-600" style={{backgroundColor: final.css}} />
          <input type="file" id="logo-upload" hidden accept="image/*" onChange={handleLogoUpload} />
          <label htmlFor="logo-upload" className="block w-full border border-dashed border-slate-500 rounded-xl p-3 text-center text-[12px] cursor-pointer bg-slate-800">📁 Subir logo</label>
          {logoUrl && <div className="flex justify-center"><div className="w-20 h-20 bg-white rounded-xl p-2"><img src={logoUrl} className="w-full h-full object-contain" /></div></div>}
          <input value={aliasMp} onChange={e=>setAliasMp(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white outline-none" placeholder="alias.mp"/>
          <input value={emailEmpresa} onChange={e=>setEmailEmpresa(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white outline-none" placeholder="email"/>
          <input value={titular} onChange={e=>setTitular(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-[12px] text-white outline-none" placeholder="Titular"/>
        </div>
        <h2 className="font-black text-[12px] pt-4 border-t border-slate-700">2. CONDICIONES</h2>
        <div className="grid grid-cols-2 gap-2">
          <div><p className="text-[10px] text-slate-400 mb-1">Descuento %</p><input type="number" value={descuento} onChange={e=>setDescuento(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white outline-none"/></div>
          <div><p className="text-[10px] text-slate-400 mb-1">Código</p><input value={nroPresu} readOnly className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[12px] text-yellow-400 font-bold"/></div>
        </div>
        <textarea value={observaciones} onChange={e=>setObservaciones(e.target.value)} rows={5} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-3 text-[12px] text-white outline-none" />
        <h2 className="font-black text-[12px] pt-4 border-t border-slate-700">3. CLIENTE</h2>
        <div className="space-y-3">
          <input value={cliente} onChange={e=>setCliente(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white outline-none" placeholder="Cliente"/>
          <input value={proyecto} onChange={e=>setProyecto(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white outline-none" placeholder="Proyecto"/>
          <input value={direccion} onChange={e=>setDireccion(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white outline-none" placeholder="Dirección obra"/>
        </div>
        <h2 className="font-black text-[12px] pt-4 border-t border-slate-700">4. ITEMS ({items.length}) - {hojas} hoja(s)</h2>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">{items.map((it, idx) => (<div key={it.id} className="border border-slate-600 rounded-xl p-3 bg-slate-800"><input value={it.desc} onChange={e=>{ const n=[...items]; n[idx].desc=e.target.value; setItems(n)}} className="w-full font-bold text-[12px] bg-transparent outline-none text-white"/><input value={it.detalle} onChange={e=>{ const n=[...items]; n[idx].detalle=e.target.value; setItems(n)}} className="w-full text-[11px] bg-transparent outline-none text-slate-400 mt-1"/><div className="flex gap-2 mt-2"><input value={it.cant} onChange={e=>{ const n=[...items]; n[idx].cant=e.target.value; setItems(n)}} className="w-16 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-[11px] text-white"/><input type="number" value={it.unit} onChange={e=>{ const n=[...items]; n[idx].unit=Number(e.target.value); setItems(n)}} className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-[11px] text-white"/><button onClick={()=>setItems(items.filter(x=>x.id!==it.id))} className="text-red-400 px-2">x</button></div></div>))}<button onClick={()=>setItems([...items, {id: Date.now().toString(), desc:"Nuevo item", detalle:"Detalle", cant:"1", unit:0}])} className="w-full bg-white text-slate-900 rounded-full py-2.5 text-[12px] font-bold">+ Agregar Item</button></div>
        <button onClick={downloadPDF} className="w-full bg-yellow-400 text-black rounded-xl py-4 font-black text-[15px] flex flex-col items-center leading-none"><span>📄 DESCARGAR PDF PRO</span><span className="text-[11px] font-black mt-1.5 bg-black text-yellow-400 px-4 py-1 rounded-full">{nroPresu} • {hojas} HOJA • ${totalConDesc.toLocaleString('es-AR')}</span></button>
      </div>
      <div className="flex-1 p-2 sm:p-6 lg:p-10 overflow-auto order-1 lg:order-2 bg-[#9aa6b8]">
        <div className="w-full max-w-[850px] mx-auto bg-[#e8ecf1] shadow-[0_25px_80px_rgba(0,0,0,0.22)] relative overflow-hidden rounded-[12px] border-[1.5px] border-slate-400 flex flex-col">
          <div className="absolute inset-[7px] border border-slate-300/80 pointer-events-none rounded-[10px]" />
          <div className="absolute inset-[10px] border pointer-events-none rounded-[8px] opacity-30" style={{borderColor: final.css}} />
          <div className="relative z-10 flex flex-col">
            <div className="p-4 flex justify-between items-center gap-3 text-white m-[7px] mb-0 rounded-t-[10px]" style={{backgroundColor: final.css}}>
              <div className="flex gap-3 items-center">{logoUrl? <div className="w-11 h-11 bg-white rounded-xl p-1.5 shadow flex items-center justify-center"><img src={logoUrl} className="w-full h-full object-contain" /></div> : <div className="w-11 h-11 bg-white/15 rounded-xl border border-white/20 grid place-items-center text-[9px] font-bold">LOGO</div>}<div><h1 className="text-[17px] font-black tracking-tight leading-none">{empresa}</h1><p className="text-[8.5px] text-white/60 mt-1 font-mono">{cuit} • {telefono}</p></div></div>
              <div className="text-right"><div className="bg-white text-[7.5px] font-black px-3 py-1 rounded-full tracking-widest shadow-sm inline-block" style={{color: final.css}}>PRESUPUESTO</div><p className="mt-1.5 text-white/70 text-[8.5px] font-mono">{nroPresu} • {hojas} hoja(s)</p></div>
            </div>
            {/* BLOQUE COMPACTO - AHORA EN UNA SOLA FILA */}
            <div className="p-2 grid grid-cols-1 gap-2 text-[9px] mx-[7px] mt-2">
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex justify-between items-center">
                <div className="flex-1"><p className="text-[6px] text-slate-400 font-black tracking-widest">CLIENTE</p><p className="font-black text-black text-[10px] leading-none mt-1 truncate">{cliente}</p><p className="text-[7px] text-slate-500 truncate">{clienteCuit}</p></div>
                <div className="w-[1px] h-8 bg-slate-200 mx-3" />
                <div className="flex-1"><p className="text-[6px] text-slate-400 font-black tracking-widest">CONTACTO</p><p className="font-bold text-slate-800 text-[8px] mt-1 truncate">{clienteContacto}</p></div>
                <div className="w-[1px] h-8 bg-slate-200 mx-3" />
                <div className="flex-[1.5]"><p className="text-[6px] text-slate-400 font-black tracking-widest">PROYECTO / OBRA</p><p className="font-bold text-black text-[8px] mt-1 truncate">{proyecto}</p><p className="text-[7px] text-slate-500 truncate">{direccion}</p></div>
                <div className="ml-3 text-right"><p className="text-[7px] font-mono font-black">{nroPresu}</p><div className="mt-1 bg-green-50 border border-green-200 text-green-700 text-[6px] font-black px-2 py-0.5 rounded-full">● VIGENTE</div></div>
              </div>
            </div>
            <div className="px-3 sm:px-4 mx-[7px] mt-1 flex flex-col pb-3">
              <div className="flex items-center gap-3 px-4 py-2 rounded-t-xl border border-slate-200 border-b-0 bg-[#f1f5f9] shadow-sm"><span className="font-black text-[9px] tracking-widest text-slate-700">DETALLE DEL PROYECTO</span><span className="ml-auto text-[7px] text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">{nroPresu} • {items.length} items</span></div>
              <div className="border border-slate-200 rounded-b-xl overflow-hidden shadow-sm bg-white">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-[1.5fr_0.4fr_0.6fr_0.6fr] text-white text-[8px] font-black p-2.5 tracking-wider" style={{backgroundColor: final.css}}><span>DESCRIPCIÓN</span><span className="text-center">CANTIDAD</span><span className="text-center">PRECIO UNITARIO</span><span className="text-right">SUBTOTAL</span></div>
                  {items.map((it, i) => (<div key={it.id} className={`grid grid-cols-[1.5fr_0.4fr_0.6fr_0.6fr] px-4 py-2 text-[10px] border-b border-slate-100 items-center ${i%2===0? 'bg-white' : 'bg-[#f8f9fb]'}`}><div className="pr-3"><p className="font-bold text-black leading-tight text-[10px]">{it.desc}</p><p className="text-[8px] text-slate-500 mt-0.5">{it.detalle}</p></div><span className="text-center font-bold text-black text-[10px]">{it.cant}</span><span className="text-center font-medium text-slate-700 text-[9px]">${it.unit.toLocaleString('es-AR')}</span><span className="text-right font-black text-black text-[10px]">${(it.unit * (parseFloat(it.cant)||1)).toLocaleString('es-AR')}</span></div>))}
                </div>
              </div>
              <div className="mt-4 flex justify-end"><div className="w-full sm:w-[320px] bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-1.5"><div className="flex justify-between text-[10px] text-slate-600 px-2"><span>Subtotal:</span><span className="font-bold text-black">${totalReal.toLocaleString('es-AR')}</span></div><div className="h-[1px] bg-slate-200" /><div className="flex justify-between text-[10px] text-slate-600 px-2"><span>IVA:</span><span>$0</span></div><div className="flex justify-between items-center text-white px-4 py-2.5 rounded-xl font-black text-[13px] shadow-md mt-1.5" style={{backgroundColor: final.css}}><span>TOTAL:</span><span>${totalConDesc.toLocaleString('es-AR')}</span></div></div></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div className="border border-slate-200 rounded-xl p-3 text-[9px] bg-white shadow-sm"><p className="font-black text-slate-900 text-[9px]">ⓘ Observaciones y Condiciones:</p><div className="h-[1px] bg-slate-200 my-1.5" /><p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-[8.5px]">{observaciones}</p></div>
                <div className="rounded-xl p-3 flex gap-3 border-2 shadow-sm bg-white" style={{borderColor: `${final.css}30`}}><div className="flex-1 text-[9px] text-slate-700"><p className="font-black text-[10px]" style={{color: final.css}}>DATOS DE PAGO • VERIFICACIÓN</p><div className="h-[1px] bg-slate-200 my-1.5" /><p><span className="font-bold text-[8px] text-slate-500">ALIAS:</span><br/><span className="font-black text-[11px] text-black">{aliasMp}</span></p><p className="mt-1.5 text-[8px] leading-relaxed">{titular}<br/>{cuit}<br/>Cod: {nroPresu}</p></div><div className="text-center"><div className="w-16 h-16 bg-slate-50 p-1 rounded-xl border border-slate-200 grid place-items-center text-[6px] text-black font-bold">QR<br/>{nroPresu}</div></div></div>
              </div>
              <div className="grid grid-cols-2 gap-8 mt-4 pt-3 border-t border-slate-200"><div><div className="h-[1px] bg-slate-800 w-full mb-1.5"/><p className="text-[8px] font-bold text-slate-800">Firma y aclaración - {empresa}</p><p className="text-[7px] text-slate-500">{titular}</p></div><div><div className="h-[1px] bg-slate-800 w-full mb-1.5"/><p className="text-[8px] font-bold text-slate-800">Firma cliente - Aceptación</p><p className="text-[7px] text-slate-500">Acepto condiciones</p></div></div>
              <div className="mt-4 border-t-2 pt-2.5 pb-2 flex flex-col items-center" style={{borderColor: final.css}}><p className="text-center text-[8px] text-slate-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-full">{empresa} • {emailEmpresa} • {telefono} • Verificar: {nroPresu}</p></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}