const moment = require('moment')
const { startT, endT } = require('../config')
export const getStartEndDate3 = (i = 0) => {
  let start = moment()
    .subtract(i, 'day')
    .hour(endT.h)
    .minute(endT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  let end = moment()
    .subtract(i - 1, 'day')
    .hour(startT.h)
    .minute(startT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  return { start, end }
}
export const getStartEndDate = (i = 0) => {
  let start = moment()
    .subtract(1, 'day')
    .hour(endT.h)
    .minute(endT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  let end = moment()
    .hour(startT.h)
    .minute(startT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  if (moment().hour() >= endT.h) {
    start = moment()
      .hour(endT.h)
      .minute(endT.m)
      .second(0)
      .millisecond(0)
      .toDate()
    end = moment().toDate()
  }
  return { start, end }
}
export const getStartEndDate2 = () => {
  let start = moment()
    .subtract(1, 'day')
    .hour(startT.h)
    .minute(startT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  let end = moment()
    .hour(startT.h)
    .minute(startT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  if (moment().hour() >= endT.h) {
    start = moment()
      .hour(endT.h)
      .minute(endT.m)
      .second(0)
      .millisecond(0)
      .toDate()
    end = moment().toDate()
  }
  return { start, end }
}

export const sysdate = (date = new Date()) => {
  let { day, month, year, hour, minute } = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type != 'literal') {
        acc[part.type] = part.value
      }
      return acc
    }, Object.create(null))
  return `${day}-${month}-${year} ${hour}:${minute}`
}
export const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
