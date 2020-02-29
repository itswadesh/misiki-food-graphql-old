import fsx from 'fs-extra'
export const exportCSV = async ({
  name,
  model,
  skip,
  limit,
  where,
  fields
}: any) => {
  const Json2csvParser = require('json2csv').Parser
  const filePath = `./exports/${name}.csv`
  let csv
  let data = []
  try {
    data = await model
      .aggregate([{ $match: where }, { $skip: skip }, { $limit: limit }])
      .allowDiskUse(true)
  } catch (e) {
    console.log('export err...', e.toString())
    data = [e.toString()]
  }
  let unwindBlank: any = []
  try {
    const json2csvParser = new Json2csvParser({
      fields,
      unwindBlank,
      flatten: true
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
  setTimeout(async function() {
    try {
      await fsx.unlink(filePath) // delete file after 30 sec
    } catch (e) {
      console.error(e.toString())
    }
  }, 30000)
}
