import { Setting } from '../models'
export const sms = async (params: any) => {
  try {
    let settings = await Setting.findOne({}).exec()
    if (!settings || !settings.sms.enabled) return
    fetch(
      `http://78.46.85.205:5684/api/SendSMS?api_id=API12517803163&api_password=12345678&sms_type=T&encoding=T&sender_id=MISIKI&phonenumber=${params.phone}&textmessage=${params.msg}`
    )
    console.log(params.msg)
  } catch (error) {
    console.error('sms err...', error)
  }
}
