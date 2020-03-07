import { Setting, Product } from '../models'
import { toJson } from './json'
import { fields } from './'
import { searchFields } from './graphql'

export const index = async ({ model, args, info, userId }: any) => {
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
    pageSize = setting.pageSize || 10
  if (page == 0 && qlimit != 0) {
    // If page param supplied as 0, limit specified (Deactivate paging)
    limit = qlimit
    pageSize = limit
  } else {
    // Normal pagination
    limit = setting.pageSize || 10
    skip = (page - 1) * (setting.pageSize || 10)
  }
  if (args.uid) {
    // Find only records that belong to the logged in user
    where.uid = args.uid
  }

  let searchString = where
  if (search != 'null' && !!search)
    searchString = { ...where, q: { $regex: new RegExp(search, 'ig') } }
  try {
    let data: any = await model
      .find(searchString, searchFields(info))
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate(populate)
      .exec()
    let count: any = await model.countDocuments(searchString)
    return { data, count, pageSize, page }
  } catch (e) {
    throw e
  }
}
