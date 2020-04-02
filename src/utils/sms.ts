import { Setting } from '../models'
import fetch from 'node-fetch'
export const sms = async (params: any) => {
  try {
    let settings = await Setting.findOne({}).exec()
    if (!settings || !settings.sms.enabled) return
    fetch(
      `http://5.9.0.178:8000/Sendsms?user=demo&password=demo@543&sender=DIGSMS&dest=${params.phone}&apid=21014&text=${params.msg}&dcs=0`
    )
    console.log(`${params.phone} = ${params.msg}`)
  } catch (error) {
    console.error('sms err...', error)
  }
}
