import Settings from './../settings/model';
import axios from 'axios'
export const sms = async ({ phone, msg }) => {
    try {
        let settings = await Settings.findOne({}).exec()
        if (!settings || !settings.sms.enabled) return
        axios.get(`http://78.46.85.205:5684/api/SendSMS?api_id=API12517803163&api_password=12345678&sms_type=T&encoding=T&sender_id=MISIKI&phonenumber=${phone}&textmessage=${msg}`)
        console.log(msg);
    } catch (error) {
        console.error('sms err...', error);
    }
}