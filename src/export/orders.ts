import { exportCSV, toJson } from '../utils'
import { Order } from '../models'
export default async function(req: any, res: any) {
  const name = 'orders'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit || 30)
  const where = toJson(req.query.where) || {}
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  try {
    let filePath = await exportCSV({
      name,
      model: Order,
      skip,
      limit,
      where,
      fields: [
        '_id',
        'orderNo',
        'user.firstName',
        'user.lastName',
        'user.address',
        'user.phone',
        'address.firstName',
        'address.lastName',
        'address.address',
        'address.phone',
        'address.zip',
        'amount.qty',
        'amount.subtotal',
        'amount.shipping',
        'amount.discount',
        'amount.tax',
        'amount.total',
        'cod_paid',
        'item.0.name',
        'item.0.slug',
        'item.0.img',
        'item.0.qty',
        'item.0.price',
        'item.0.status',
        'item.0.vendor.restaurant',
        'item.0.vendor.address',
        'item.0.vendor.phone',
        'item.0.vendor.firstName',
        'item.0.vendor.lastName'
      ]
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
