import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, Response, UserDocument, ChatDocument, InfoDocument } from '../types'
import { signUp, signIn, objectId, signInOtp } from '../validators'
import { attemptSignIn, verifyOtp, signOut } from '../auth'
import { User } from '../models'
import { fields, generateOTP } from '../utils'

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
    users: (root, args, ctx, info): Promise<UserDocument[]> => {
      // TODO: pagination
      return User.find({}, fields(info)).exec()
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
    updateProfile: async (
      root,
      args: { firstName: string, lastName: string, info: InfoDocument },
      { req }: { req: Request },
      info
    ): Promise<UserDocument> => {
      const { userId } = req.session
      let user = await User.findById(userId)
      if (!user)
        throw new UserInputError(`User not found`)
      user.firstName = args.firstName
      user.lastName = args.lastName
      user.info = args.info
      user.save()
      return user
    },
    verifyOtp: async (
      root,
      args: { phone: string, otp: string },
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
      const otp = generateOTP();
      let user = await User.findOne({ phone: args.phone })
      if (!user)
        await User.create({ phone: args.phone, password: otp })
      else {
        user.password = otp.toString()
        await user.save()
      }
      return otp
    },
    signUp: async (
      root,
      args: { email: string; firstName: string; lastName: string; password: string },
      { req }: { req: Request }
    ): Promise<UserDocument> => {
      await signUp.validateAsync(args, { abortEarly: false })

      const user = await User.create(args)

      req.session.userId = user.id

      return user
    },
    signIn: async (
      root,
      args: { email: string; password: string },
      { req }: { req: Request },
      info
    ): Promise<UserDocument> => {
      await signIn.validateAsync(args, { abortEarly: false })

      const user = await attemptSignIn(args, fields(info))

      req.session.userId = user.id

      return user
    },
    signOut: (
      root,
      args,
      { req, res }: { req: Request; res: Response }
    ): Promise<boolean> => {
      return signOut(req, res)
    }
  },
}

export default resolvers
