import { Setting } from '../models'
import { sms } from '.'

export const generateOTP = () => {
  let otp = Math.floor(1000 + Math.random() * 9000)
  return otp
}
export const requestOTP = async (phone: string, otp: number) => {
  try {
    sms({ phone, msg: `Hi. ${otp} is your OTP to login to Misiki`, otp })
  } catch (e) {
    throw e
  }
}
