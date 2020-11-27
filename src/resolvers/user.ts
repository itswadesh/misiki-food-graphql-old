import {
  IResolvers,
  UserInputError,
  AuthenticationError,
} from 'apollo-server-express'
import {
  Request,
  Response,
  UserDocument,
  ChatDocument,
  InfoDocument,
  AddressDocument,
} from '../types'
import {
  signUp,
  signIn,
  objectId,
  signInOtp,
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validation'
import { logIn, verifyOtp, signOut, changePassword } from '../auth'
import { User } from '../models'
import { fields, generateOTP, index, requestOTP } from '../utils'
import { email } from '../utils/email'

const resolvers: IResolvers = {
  Query: {
    me: (
      root: any,
      args: any,
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      return User.findById(req.session.userId, fields(info)).exec()
    },
    users: (root: any, args: any, { req }: { req: Request }, info) => {
      return index({ model: User, args, info })
    },
    user: async (
      root: any,
      args: { id: string },
      ctx,
      info
    ): Promise<UserDocument | null> => {
      await objectId.validateAsync(args)
      return User.findById(args.id, fields(info))
    },
  },
  Mutation: {
    changePassword: async (
      root: any,
      args: any,
      { req }: { req: Request },
      info
    ): Promise<Boolean> => {
      await validate(changePasswordSchema, args)
      const { oldPassword, password } = args
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('User not registered') //Invalid old password provided
      if (!(await user.matchesPassword(oldPassword)))
        throw new AuthenticationError(
          'Incorrect old password. Please try again.'
        )
      user.password = password
      user.save()
      // email({
      //   to: user.email,
      //   subject: ' Password Changed',
      //   template: 'user/change-password',
      //   context: user
      // })
      return true
    },
    updateProfile: async (
      root: any,
      args: {
        id: string
        firstName: string
        lastName: string
        avatar: string
        role: string
        verified: boolean
        info: InfoDocument
        address: AddressDocument
      },
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      const { userId } = req.session
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $set: args },
        { new: true }
      )
      if (!user) throw new UserInputError('User Not Found.')
      user.save()
      return user
    },
    saveUser: async (
      root: any,
      args: {
        id: string
        firstName: string
        lastName: string
        avatar: string
        role: string
        verified: boolean
        info: InfoDocument
        address: AddressDocument
      },
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      const { userId } = req.session
      const user = await User.findOneAndUpdate({ _id: args.id }, { $set: args })
      return user
    },
    verifyOtp: async (
      root: any,
      args: { phone: string; otp: string },
      { req }: { req: Request },
      info
    ): Promise<UserDocument> => {
      await signInOtp.validateAsync(args, { abortEarly: false })
      const user = await verifyOtp(args, fields(info))

      req.session.userId = user.id

      return user
    },
    getOtp: async (
      root: any,
      args: { phone: string },
      { req }: { req: Request }
    ): Promise<String> => {
      const otp = generateOTP().toString()
      let user = await User.findOne({ phone: args.phone })
      if (!user) {
        const u = new User({ phone: args.phone, password: otp })
        if (!u) throw new UserInputError('User not found')
        await u.save()
      } else {
        user.password = otp.toString()
        await user.save()
      }
      requestOTP(args.phone, otp)
      return otp
    },
    register: async (
      root: any,
      args: {
        email: string
        firstName: string
        lastName: string
        password: string
        referrer: string
      },
      { req }: { req: Request }
    ): Promise<UserDocument> => {
      await validate(registerSchema, args)

      const { email, firstName, lastName, password, referrer } = args

      const found = await User.exists({ email })

      if (found) {
        throw new UserInputError('Email already registed with us')
      }

      const user = new User({
        email,
        firstName,
        lastName,
        password,
        referrer,
      })
      await user.save()
      logIn(req, user.id)

      return user
    },
    login: async (
      root: any,
      args: { email: string; password: string },
      { req }: { req: Request },
      info
    ): Promise<UserDocument> => {
      try {
        await validate(loginSchema, args)

        const { email, password } = args

        const user = await User.findOne({ email })

        if (!user || !(await user.matchesPassword(password))) {
          throw new UserInputError('Incorrect email or password')
        }

        logIn(req, user.id)

        return user
      } catch (e) {
        throw e
      }
    },
    signOut: (
      root: any,
      args: any,
      { req, res }: { req: Request; res: Response }
    ): Promise<boolean> => {
      return signOut(req, res)
    },
  },
}

export default resolvers
