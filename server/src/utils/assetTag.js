// Generates the next asset tag like AF-0001. Zero-padded to 4 digits (fine up to 9999).
export const nextAssetTag = async (client) => {
  const last = await client.asset.findFirst({ orderBy: { tag: 'desc' }, select: { tag: true } })
  const n = last ? parseInt(last.tag.split('-')[1], 10) + 1 : 1
  return `AF-${String(n).padStart(4, '0')}`
}
