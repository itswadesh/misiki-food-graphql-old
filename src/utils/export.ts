import fsx from 'fs-extra'
import { ObjectId } from 'mongodb'
import order from '../typeDefs/order'
export const exportCSV = async ({
  name,
  model,
  skip,
  limit,
  where,
  fields,
}: any) => {
  const Json2csvParser = require('json2csv').Parser
  const filePath = `./exports/${name}.csv`
  let csv
  let data = []
  try {
    // console.log('before aggregation for export:', where)
    where = convertToObjectId(where)
    if (name == 'products') {
      data = await model
        .aggregate([
          { $match: where },
          {
            $lookup: {
              from: 'colors',
              localField: 'color',
              foreignField: '_id',
              as: 'color',
            },
          },
          {
            $unwind: '$color',
          },
          {
            $lookup: {
              from: 'brands',
              localField: 'brand',
              foreignField: '_id',
              as: 'brand',
            },
          },
          {
            $unwind: '$brand',
          },
          { $skip: skip },
          { $limit: limit },
        ])
        .allowDiskUse(true)
      data.map((p) => {
        // console.log('AAA', p)
        p.brand = p.brand.name
        p.color = p.color.name
      })
    }
    if (name == 'orders') {
      const orders = await model
        .aggregate([
          { $match: where },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          { $skip: skip },
          { $limit: limit },
        ])
        .allowDiskUse(true)
      for (let o of orders) {
        if (o.items.length > 1) {
          // console.log('more than one item in order-id:', o._id, 'so split')
          for (let item of o.items) {
            let order = { ...o }
            delete order.items
            order.item = item
            data.push(order)
          }
        } else {
          // console.log('only one item in order-id:', o._id)
          o.item = o.items[0]
          delete o.items
          data.push(o)
        }
      }
    }
    // console.log('data', data)

    // data = await model
    //   .aggregate([
    //     {
    //       $match: {
    //         brand: {
    //           $in: [
    //             ObjectID('6014c 7762697f84598c730b7'),
    //             ObjectID('6014c7762697f84598c730bb'),
    //           ],
    //         },
    //       },
    //     },
    //     { $skip: skip },
    //     { $limit: limit },
    //   ])
    //   .allowDiskUse(true)
    // console.log('after aggregation the data is:', data.length, data)
  } catch (e) {
    console.log('export err...', e.toString())
    data = [e.toString()]
  }
  let unwindBlank: any = []
  try {
    const json2csvParser = new Json2csvParser({
      fields,
      unwindBlank,
      flatten: true,
    })
    csv = json2csvParser.parse(data)
  } catch (err) {
    throw err
  }
  try {
    await fsx.writeFile(filePath, csv)
    await delayDelete(filePath)
    return filePath
  } catch (e) {
    throw e
  }
}
export const delayDelete = async (filePath: string) => {
  setTimeout(async function () {
    try {
      await fsx.unlink(filePath) // delete file after 30 sec
    } catch (e) {
      console.error(e.toString())
    }
  }, 30000)
}

const convertToObjectId = (data: any) => {
  if (data.vendor && data.vendor.$in) {
    data.vendor.$in = data.vendor.$in.map((vendor: any) => {
      return new ObjectId(vendor)
    })
  }
  if (data.brand && data.brand.$in) {
    data.brand.$in = data.brand.$in.map((brand: any) => {
      return new ObjectId(brand)
    })
  }
  if (data.color && data.color.$in) {
    data.color.$in = data.color.$in.map((color: any) => {
      return new ObjectId(color)
    })
  }
  if (data.size && data.size.$in) {
    data.size.$in = data.size.$in.map((size: any) => {
      return new ObjectId(size)
    })
  }
  if (data.categories && data.categories.$in) {
    data.categories.$in = data.categories.$in.map((categories: any) => {
      return new ObjectId(categories)
    })
  }
  return data
}
