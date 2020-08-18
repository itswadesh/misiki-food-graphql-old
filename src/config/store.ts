export const SHOP_NAME = 'Misiki'

export const PAY_MESSAGE = 'Payment for food @ ' + SHOP_NAME

export const ORDER_PREFIX = 'M'

export const STATIC_PATH = './../misiki-images'

export const UPLOAD_DIR = '/images/'

export const startT = { h: 18, m: 0 }
export const start = '06:00 pm'
export const endT = { h: 22, m: 0 }
export const end = '10:00 pm'

export const closed = {
  from: { hour: 18, minute: 0 },
  to: { hour: 22, minute: 0 },
  message: 'Sorry we are closed from 6:00 PM to 10:00 PM',
}
// prettier-ignore
export const userRoles = ['user', 'chef', 'delivery', 'vendor', 'manager', 'admin'] // This should be in ascending order of authority. e.g. In this case guest will not have access to any other role, where as admin will have the role of guest+user+vendor+manager+admin

export const language = 'en'
// prettier-ignore
export const worldCurrencies = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'XSU', 'XUA', 'YER', 'ZAR', 'ZMW', 'ZWL']

export const sorts = [
  { name: 'Relevance', val: null },
  { name: 'Whats New', val: '-createdAt' },
  { name: 'Price low to high', val: 'price' },
  { name: 'Price high to low', val: '-price' },
]
export const paymentStatuses = ['pending', 'cancelled', 'paid']

export const orderStatuses = [
  {
    status: 'Waiting for confirmation',
    title: 'Order Placed Successfully',
    body: 'Waiting for the chef to confirm the order',
    icon: '/images/order/chef.png',
    public: true,
  },
  {
    status: 'Food is being prepared',
    title: 'Chef at work!!',
    body: 'Chef is preparing your order',
    icon: '/images/order/chef.png',
    public: true,
  },
  {
    status: 'Ready',
    title: 'Food is Ready!!',
    body: 'Your order is ready for self pickup',
    icon: '/images/order/chef.svg',
    public: true,
  },
  {
    status: 'Delivery Guy Assigned',
    title: 'Delivery Guy Assigned',
    body: 'On the way to pickup your order',
    icon: '/images/order/food-delivery-man.png',
    public: true,
  },
  {
    status: 'Out for delivery',
    title: 'Vroom Vroom!!',
    body: 'Order has been picked up and on the way',
    icon: '/images/order/delivery-man.svg',
    public: true,
  },
  {
    status: 'Delivered',
    title: 'Order Delivered',
    body: 'The order has been delivered to you',
    icon: '/images/order/account-verified.svg',
    public: true,
  },
  {
    status: 'Payment Pending',
    title: 'Payment Pending',
    body: 'Payment for order is pending',
    icon: '/images/order/account-verified.svg',
    public: false,
  },
  {
    status: 'NIS',
    title: 'Not in stock',
    body: 'Item is out of stock and could not delivered',
    icon: '/images/order/account-verified.svg',
    public: false,
  },
  {
    status: 'Cancelled',
    title: 'Order Cancelled',
    body: 'Order cancelled by user',
    icon: '/images/order/account-verified.svg',
    public: true,
  },
]
// prettier-ignore
export const timesList = ['1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 AM']
