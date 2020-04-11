exports.subtract = function(ex1: number, ex2: number) {
  return ex1 - ex2
}
exports.multiply = function(ex1: number, ex2: number) {
  return ex1 * ex2
}
exports.json = function(msg: any) {
  return JSON.stringify(msg)
}
exports.date = function(date: Date) {
  var monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  var day = date.getDate()
  var monthIndex = date.getMonth()
  var year = date.getFullYear()

  return day + ' ' + monthNames[monthIndex] + ' ' + year
}
