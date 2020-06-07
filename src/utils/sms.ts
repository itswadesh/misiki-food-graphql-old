import { Setting } from '../models'
import Axios from 'axios'
const { FAST2SMS_KEY, FAST2SMS_SENDER_ID } = process.env
export const sms = async ({ phone, msg, otp }: any) => {
  try {
    let settings = await Setting.findOne({}).exec()
    if (!settings || !settings.sms.enabled) return
    if (otp) {
      const smsString = `https://www.fast2sms.com/dev/bulk?authorization=${FAST2SMS_KEY}&sender_id=${FAST2SMS_SENDER_ID}&language=english&route=qt&numbers=${phone}&message=${1372}&variables= {AA}&variables_values=${otp}`
      await Axios(smsString)
      console.log(`${phone} = ${otp}`)
    } else {
      await Axios(
        `http://78.46.85.205:5684/api/SendSMS?api_id=API12517803163&api_password=12345678&sms_type=T&encoding=T&sender_id=MISIKI&phonenumber=${phone}&textmessage=${msg}`
      )
      console.log(`${phone} = ${msg}`)
    }
  } catch (error) {
    console.error('sms err...', error.toString())
  }
}
export const fast2Sms = async ({
  phone,
  message,
  variables,
  variables_values,
}: any) => {
  try {
    let settings = await Setting.findOne({})
    if (!settings || !settings.sms.enabled) return
    const smsString = `https://www.fast2sms.com/dev/bulk?authorization=${FAST2SMS_KEY}&sender_id=${FAST2SMS_SENDER_ID}&language=english&route=qt&numbers=${phone}&message=${message}&variables=${variables}&variables_values=${variables_values}`
    await Axios(smsString)
    console.log(`${phone} = ${variables_values}`)
  } catch (error) {
    console.error('sms err...', error.response.data)
  }
}
