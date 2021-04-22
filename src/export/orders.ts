import { exportCSV, toJson } from '../utils'
import { Order } from '../models'
export default async function (req: any, res: any) {
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
        'cartId',
        'otp',
        'user.firstName',
        'user.lastName',
        'user.address',
        'user.phone',
        'address.firstName',
        'address.lastName',
        'address.address',
        'address.phone',
        'address.zip',
        'address.email',
        'payment_id',
        'payment.type',
        'amount.qty',
        'amount.subtotal',
        'amount.shipping',
        'amount.discount',
        'amount.tax',
        'amount.total',
        'coupon',
        'comment',
        'cancellationReason',
        'cancellationComment',
        'returnComment',
        'active',
        'payment_order_id',
        'cod_paid',
        'item.status',
        'item._id',
        'item.pid',
        'item.name',
        'item.vendor.firstName',
        'item.vendor.lastName',
        'item.vendor.phone',
        'item.vendor.email',
        'item.price',
        'item.qty',
        'item.img',
        'item.reviewed',
        'createdAt',
        'updatedAt',
      ],
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
