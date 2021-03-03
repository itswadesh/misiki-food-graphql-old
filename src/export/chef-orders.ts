import { Order } from '../models'
import fsx from 'fs-extra'
const Json2csvParser = require('json2csv').Parser
const filePath = `./exports/chef-orders.csv`
let csv
export default async function (req: any, res: any) {
  try {
    let data = await Order.aggregate([
      {
        $match: { 'address.city': 'Sunabeda' },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            id: '$items.vendor.id',
            restaurant: '$items.vendor.restaurant',
            firstName: '$items.vendor.firstName',
            lastName: '$items.vendor.lastName',
            address: '$items.vendor.address',
            phone: '$items.vendor.phone',
            status: '$items.status',
          },
          count: { $sum: '$items.qty' },
          amount: { $sum: '$items.price' },
          orderNo: { $max: '$orderNo' },
          createdAt: { $max: '$createdAt' },
        },
      },
      { $sort: { '_id.address.address': 1 } },
    ])
    let unwindBlank: any = []
    try {
      const json2csvParser = new Json2csvParser({
        fields: [
          'orderNo',
          'createdAt',
          '_id.restaurant',
          '_id.firstName',
          '_id.lastName',
          '_id.phone',
          '_id.status',
          'count',
          'amount',
        ],
        unwindBlank,
        flatten: true,
      })
      csv = json2csvParser.parse(data)
    } catch (err) {
      throw err
    }
    try {
      await fsx.writeFile(filePath, csv)
      // await delayDelete(filePath)
      res.download(filePath)
      // return filePath
    } catch (e) {
      throw e
    }
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
