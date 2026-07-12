// columns: [{ key, header, render?(row) }]
export default function DataTable({ columns, rows, empty = 'No records yet.' }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-[#e6e3df]">
      <table className="min-w-full divide-y divide-[#e6e3df] text-sm">
        <thead className="bg-[#fbfaf9]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2.5 text-left font-medium text-[#847d76]">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#efece8] bg-white">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[#a39c94]">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-[#fbfaf9]">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2.5 text-[#4b453f]">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
