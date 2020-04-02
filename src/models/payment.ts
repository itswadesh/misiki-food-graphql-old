import mongoose, { Schema } from 'mongoose'
import { PaymentDocument } from '../types'

const { ObjectId } = Schema.Types

const paymentSchema = new Schema(
  {
    order_id: String,
    payment_order_id: String,
    entity: String,
    amount: Number,
    amount_paid: Number,
    amount_due: Number,
    currency: String,
    receipt: String,
    offer_id: String,
    status: String,
    attempts: Number,
    invoice_id: String,
    international: Boolean,
    method: String,
    amount_refunded: Number,
    refund_status: String,
    captured: Boolean,
    description: String,
    card_id: String,
    bank: String,
    wallet: String,
    vpa: String,
    email: String,
    contact: String,
    notes: Object,
    fee: Number,
    tax: Number,
    error_code: String,
    error_description: String,
    created_at: Date,
    q: String
  },
  {
    timestamps: true
  }
)

paymentSchema.pre('save', async function (this: PaymentDocument) {
  this.q = this.id ? this.id + " " : "";
  this.q += this.amount ? this.amount + " " : "";
  this.q += this.invoice_id ? this.invoice_id + " " : "";
  this.q += this.currency ? this.currency.toLowerCase() + " " : "";
  this.q += this.method ? this.method.toLowerCase() + " " : "";
  this.q += this.offer_id ? this.offer_id + " " : "";
  this.q += this.amount_paid ? this.amount_paid + " " : "";
  this.q += this.amount_due ? this.amount_due + " " : "";
  this.q += this.receipt ? this.receipt.toLowerCase() + " " : "";
  this.q += this.status ? this.status.toLowerCase() + " " : "";
  this.q += this.entity ? this.entity.toLowerCase() + " " : "";
  this.q += this.description ? this.description.toLowerCase() + " " : "";
  this.q += this.card_id ? this.card_id.toLowerCase() + " " : "";
  this.q += this.bank ? this.bank.toLowerCase() + " " : "";
  this.q += this.wallet ? this.wallet.toLowerCase() + " " : "";
  this.q += this.error_code ? this.error_code.toLowerCase() + " " : "";
  this.q += this.error_description ? this.error_description.toLowerCase() + " " : "";
  this.q += this.created_at ? this.created_at + " " : "";
  this.q = this.q.trim()
})
paymentSchema.index({
  '$**': 'text'
});
export default mongoose.model<PaymentDocument>('Payment', paymentSchema)
