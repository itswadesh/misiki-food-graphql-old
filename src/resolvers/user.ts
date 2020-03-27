import { IResolvers, UserInputError, AuthenticationError } from 'apollo-server-express'
import {
  Request,
  Response,
  UserDocument,
  ChatDocument,
  InfoDocument,
  AddressDocument
} from '../types'
import { signUp, signIn, objectId, signInOtp, validate, registerSchema, loginSchema, changePasswordSchema } from '../validation'
import { logIn, verifyOtp, signOut, changePassword } from '../auth'
import { User } from '../models'
import { fields, generateOTP, index, requestOTP } from '../utils'
import { email } from '../utils/email'

const resolvers: IResolvers = {
  Query: {
    me: (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      return User.findById(req.session.userId, fields(info)).exec()
    },
    users: (root, args, { req }: { req: Request }, info) => {
      return index({ model: User, args, info })
    },
    user: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<UserDocument | null> => {
      await objectId.validateAsync(args)
      return User.findById(args.id, fields(info))
    }
  },
  Mutation: {
    changePassword: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<Boolean> => {
      await validate(changePasswordSchema, args)
      const { oldPassword, password } = args
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user)
        throw new UserInputError('User not registered') //Invalid old password provided
      if (!(await user.matchesPassword(oldPassword)))
        throw new AuthenticationError('Incorrect old password. Please try again.')
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
      root,
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
      return user
    },
    saveUser: async (
      root,
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
        { _id: args.id },
        { $set: args }
      )
      return user
    },
    verifyOtp: async (
      root,
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
      root,
      args: { phone: string },
      { req }: { req: Request }
    ): Promise<Number> => {
      const otp = generateOTP()
      let user = await User.findOne({ phone: args.phone })
      if (!user) await User.create({ phone: args.phone, password: otp })
      else {
        user.password = otp.toString()
        await user.save()
      }
      requestOTP(args.phone, otp);
      return otp
    },
    register: async (
      root,
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

      const user = await User.create({
        email,
        firstName,
        lastName,
        password,
        referrer
      })

      logIn(req, user.id)

      return user
    },
    login: async (
      root,
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
      root,
      args,
      { req, res }: { req: Request; res: Response }
    ): Promise<boolean> => {
      return signOut(req, res)
    }
  }
}

export default resolvers
