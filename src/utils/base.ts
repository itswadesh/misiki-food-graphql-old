import { Setting, Product, Category, User } from '../models'
import { toJson } from './json'
import { fields } from './'
import { searchFields } from './graphql'
import { UserInputError } from 'apollo-server-express'

export const index = async ({ model, args, info, userId }: any) => {
  const setting: any = await Setting.findOne()
  if (!setting) throw new UserInputError('No settings defined in database')
  let page = !args.page && args.page != 0 ? 1 : parseInt(args.page)
  const qlimit = parseInt(args.limit || 0)
  const sort = args.sort || '-_id'
  const search = args.search
  const select = toJson(info)
  const populate = toJson(args.populate)
  delete args.page
  delete args.sort
  delete args.search
  delete args.select
  delete args.populate
  delete args.limit
  let where = args

  for (let k in where) {
    if (
      (where[k] === '' ||
        where[k] == 'null' ||
        where[k] === 'undefined' ||
        where[k] === undefined) &&
      typeof where[k] != 'boolean'
    )
      delete where[k]

    if (where[k] == 'blank') where[k] = null
  }
  if (where.category) {
    const c: any = await Category.findOne({ slug: where.category })
    if (c) {
      where.categories = c.id
      delete where.category
    }
  }
  if (where.vendor) {
    const c = await User.findOne({ role: 'vendor', slug: where.vendor })
    if (c) where.vendor = c._id
  }
  where = toJson(where) || {}
  let role = 'user'
  //   if (req.user) {
  //     role = req.user.role
  //   }
  let skip = 0,
    limit = 0,
    pageSize = setting.pageSize || 1,
    noOfPage = 1

  if (page == 0 && qlimit != 0) {
    // If page param supplied as 0, limit specified (Deactivate paging)
    limit = qlimit
    pageSize = limit
  } else if(qlimit!=0) {
    // Normal pagination
    limit = setting.pageSize || 1
    skip = (page - 1) * (setting.pageSize || 1)
  }else{
    limit = 40
    skip = 0
  }
  if (args.user) {
    // Find only records that belong to the logged in user
    where.user = args.user
  }
  let searchString = where
  if (search != 'null' && !!search)
    searchString = { ...where, $text: { $search: search } }
  try {
    let data: any = await model
      .find(searchString, searchFields(info))
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate(populate)
      .exec()
    let count: any = await model.countDocuments(searchString)
    noOfPage = Math.ceil(count / pageSize || 1)
    return { data, count, pageSize, noOfPage, page }
  } catch (e) {
    throw e
  }
}

export const indexSub = async ({ model, args, info }: any) => {
  const setting: any = await Setting.findOne()
  let page = !args.page && args.page != 0 ? 1 : parseInt(args.page)
  const qlimit = parseInt(args.limit || 0)
  const sort = args.sort || '-_id'
  const search = args.search
  const select = toJson(info)
  const populate = toJson(args.populate)
  delete args.page
  delete args.sort
  delete args.search
  delete args.select
  delete args.populate
  delete args.limit
  let where = args

  for (let k in where) {
    if (
      where[k] == '' ||
      where[k] == 'null' ||
      where[k] == 'undefined' ||
      where[k] == undefined
    )
      delete where[k]
    if (where[k] == 'blank') where[k] = null
  }
  where = toJson(where) || {}
  let role = 'user'

  //   if (req.user) {
  //     role = req.user.role
  //   }
  let skip = 0,
    limit = 0,
    pageSize = setting.pageSize || 1,
    noOfPage = 1
  if (page == 0 && qlimit != 0) {
    // If page param supplied as 0, limit specified (Deactivate paging)
    limit = qlimit
    pageSize = limit
  } else {
    // Normal pagination
    limit = setting.pageSize || 1
    skip = (page - 1) * (setting.pageSize || 1)
  }
  if (args.user) {
    // Find only records that belong to the logged in user
    where.user = args.user
  }
  let searchString = where
  if (search != 'null' && !!search)
    searchString = { ...where, q: { $regex: new RegExp(search, 'ig') } }
  let data: any = await model.aggregate([
    { $match: searchString },
    { $unwind: '$items' },
    { $match: args },
    // { $project: { orderNo: 1, createdAt: 1, updatedAt:1, items: 1, address: 1, s: { $sum: "$items.price" } } },
    {
      $group: {
        _id: {
          id: '$_id',
          orderNo: '$orderNo',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          reviewed: '$reviewed',
          address: '$address',
          payment: '$payment',
          amount: '$amount',
          vendor: '$items.vendor',
          user: '$user',
        },
        items: { $addToSet: '$items' },
        total: { $sum: '$items.price' },
      },
    },
    { $sort: { _id: -1 } },
  ])
  let count: any = await model.countDocuments(searchString)
  noOfPage = Math.ceil(count / pageSize || 1)
  return { data, count, pageSize, noOfPage, page }
}
