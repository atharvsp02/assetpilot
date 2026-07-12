import { logActivity } from '../utils/activity.js'

// The ONLY path that mutates asset.status. Always logs the change.
// Pass a transaction client so the status change + log + caller's work commit atomically.
export const setAssetStatus = async (client, assetId, status, actorId, reason) => {
  const asset = await client.asset.update({ where: { id: assetId }, data: { status } })
  await logActivity(client, {
    actorId,
    action: `ASSET_${status}`,
    entity: 'Asset',
    entityId: assetId,
    detail: { status, reason },
  })
  return asset
}
