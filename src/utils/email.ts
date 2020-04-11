import { Setting } from '../models'

const Puppeteer = require('puppeteer')
const Handlebars = require('handlebars')
const fs = require('fs')
const Util = require('util')
const ReadFile = Util.promisify(fs.readFile)
const helpers = require('./hbs-helpers')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const sg = require('nodemailer-sendgrid-transport')
const hbsOptions = {
  viewEngine: {
    extname: '.hbs',
    layoutsDir: './../templates/',
    defaultLayout: 'default',
    partialsDir: './../templates/partials/',
    helpers
  },
  viewPath: './../templates/',
  extName: '.hbs'
}
const { SENDGRID_API_KEY } = process.env
const options = { auth: { api_key: SENDGRID_API_KEY } }
var mailer = nodemailer.createTransport(sg(options))
mailer.use('compile', hbs(hbsOptions))

export const email = async ({
  to,
  cc = null,
  bcc = null,
  subject,
  template,
  context = {},
  attachments = []
}: any) => {
  if (!SENDGRID_API_KEY) {
    return 'Sendgrid API key not set at .env'
  }
  let settings
  try {
    settings = await Setting.findOne()
  } catch (e) {
    throw new Error(e)
  }
  if (!settings || !settings.email || !settings.email.enabled) return
  try {
    const info = await mailer.sendMail({
      from: settings.email.from,
      to,
      cc,
      bcc,
      subject,
      template,
      context,
      attachments
    })
    console.log('email sent...', info)
    return info
  } catch (e) {
    console.log('email err..', e.toString())
    return false
  }
}
export const emailWithPdf = async ({
  to,
  subject,
  emailTemplate,
  context,
  attachmentTemplate,
  pdfExportPath,
  attachmentFileName
}: any) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) return
    const html1 = await html({ context, attachmentTemplate })
    const browser = await Puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setContent(html1)
    await page.pdf({ path: pdfExportPath })
    await browser.close()
    const emailObj: any = {
      to,
      cc: settings.email.cc,
      bcc: settings.email.bcc,
      subject,
      template: emailTemplate,
      context,
      attachments: [
        {
          // file on disk as an attachment
          filename: attachmentFileName,
          path: pdfExportPath
        }
      ]
    }
    try {
      await email(emailObj)
    } catch (e) {
      console.log('Email error...', e)
    }
  } catch (e) {
    console.log('eeeeeeeeeeeeeeeee', e)
  }
}
const html = async ({ context, attachmentTemplate }: any) => {
  try {
    const content = await ReadFile(attachmentTemplate, 'utf8')
    Handlebars.registerHelper('date', helpers.date)
    Handlebars.registerHelper('subtract', helpers.subtract)
    Handlebars.registerHelper('multiply', helpers.multiply)
    const template = Handlebars.compile(content)
    return template(context)
  } catch (e) {
    console.log('err converting html', e)
    throw new Error(e)
  }
}

// export const email = async ({ to, subject, template, context }) => {
//     if (!SENDGRID_API_KEY) {
//         throw new Error('Sendgrid API key not set at .env')
//     }
//     let settings
//     try {
//         settings = await Settings.findOne()
//     } catch (e) {
//         throw new Error(e)
//     }
//     if (!settings || !settings.email || !settings.email.enabled)
//         return
//     var hbsOptions = {
//         viewEngine: { extname: '.hbs', layoutsDir: 'templates/', defaultLayout: 'blank', partialsDir: 'views/partials/', helpers }, viewPath: 'templates/', extName: '.hbs'
//     };

//     var options = { auth: { api_key: SENDGRID_API_KEY } }
//     var mailer = nodemailer.createTransport(sg(options));
//     mailer.use('compile', hbs(hbsOptions));

//     try {
//         const emailObj: any = { to, subject, template, context }
//         const info = await this.email(emailObj)
//         console.log('email sent...', info);
//         return info
//     } catch (e) {
//         console.log('email err...', e);
//         throw new Error(e)
//     }
// }

// export const zohoMail = async ({ from, to, subject, bcc, template, html, context }: any) => {
//     let settings = await Settings.findOne({})
//     if (!settings || !settings.email.enabled) return
//     // https://www.youtube.com/watch?v=JJ44WA_eV8E
//     const nodemailer = require('nodemailer')
//     const hbs = require('nodemailer-express-handlebars')
//     let smtpTransport = nodemailer.createTransport({
//         host: emailHost,
//         port: 465,
//         secure: true,
//         auth: {
//             user: shopEmail,
//             pass: process.env.ZOHO_PASSWORD
//         }
//     });
//     let mailObj: any = {
//         from: from || emailFrom, // When request is from contact us
//         to,
//         bcc,
//         subject,
//         html
//     }
//     if (template) {
//         smtpTransport.use('compile', hbs({
//             viewPath: 'templates',
//             extName: '.hbs',
//             helpers: register(null)
//         }))
//         mailObj = {
//             from: from || emailFrom, // When request is from contact us
//             to,
//             bcc,
//             subject,
//             template,
//             context
//         }
//     }
//     try {
//         const info = await smtpTransport.sendMail(mailObj)
//         return info
//     } catch (err) {
//         throw err.toString()
//     }
// }
