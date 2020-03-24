/* eslint-disable @typescript-eslint/no-use-before-define */
import { model, Schema } from 'mongoose'
import { hash, compare } from 'bcryptjs'
import { UserDocument, UserModel } from '../types'

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    phone: String,
    email: {
      type: String,
      validate: [
        async (email: string): Promise<boolean> =>
          (await User.count({ email })) < 2,
        'Email is already taken.'
      ]
    },
    password: String,
    role: {
      type: String,
      default: 'user'
    },
    gender: String,
    city: String,
    info: { type: Object, default: {} },
    avatar: String,
    provider: String,
    facebook: Object,
    twitter: Object,
    google: Object,
    github: Object,
    active: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    address: Object,
    meta: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String
  },
  {
    versionKey: false,
    timestamps: true
  }
)

userSchema.pre('save', async function (this: UserDocument) {
  if (this.isModified('password')) {
    this.password = await User.hash(this.password)
  }
})

userSchema.statics.hash = (password: string): Promise<string> =>
  hash(password, 10)

userSchema.methods.matchesPassword = function (
  this: UserDocument,
  password: string
): Promise<boolean> {
  return compare(password, this.password)
}

const User = model<UserDocument, UserModel>('User', userSchema)

userSchema.pre('save', async function (this: UserDocument) {
  this.q = this.firstName ? this.firstName.toLowerCase() + " " : "";
  this.q += this.lastName ? this.lastName.toLowerCase() + " " : "";
  this.q += this.phone ? this.phone + " " : "";
  this.q += this.email ? this.email.toLowerCase() + " " : "";
  this.q += this.role ? this.role.toLowerCase() + " " : "";
  this.q += this.gender ? this.gender.toLowerCase() + " " : "";
  this.q += this.city ? this.city.toLowerCase() + " " : "";
  this.q += this.active ? this.active + " " : "";
  this.q = this.q.trim()
})

export default User
