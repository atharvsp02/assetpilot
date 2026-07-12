export default function KpiCard({ label, value, accent = 'text-[#37322f]' }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-[#e6e3df]">
      <div className={`text-3xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-sm text-[#847d76]">{label}</div>
    </div>
  )
}
