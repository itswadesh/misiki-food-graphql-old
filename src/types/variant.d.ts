import { Document } from 'mongoose'

export interface VariantDocument extends Document {
  img: [string]
  price: number
  mrp: number
  discount: number
  shipping: number
  size: string
  color: string
  trackInventory: boolean
  stock: number
  unit: number
  weight: number
  sku: string
  barcode: string
  sameImages: boolean
  active: boolean
  enableUnitPrice: boolean
  saleFromDate: string
  saleToDate: string
}
