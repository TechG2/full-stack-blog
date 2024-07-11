import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { PassportStatic } from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
dotenv.config()

const prisma = new PrismaClient()

async function initialize(passport: PassportStatic, getUserByEmail: Function) {
    const authenticateUser = async (
        email: string,
        password: string,
        done: Function
    ) => {
        const user = await getUserByEmail(email)
        if (!user)
            return done("L'email non è collegata ad alcun account", false)

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else return done('Password non corretta', false)
        } catch (e) {
            return done(e)
        }
    }

    passport.use(
        new LocalStrategy({ usernameField: 'email' }, authenticateUser)
    )
    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: process.env.JWT_SECRET!,
            },
            async (jwt_payload, done) => {
                const userId: number = jwt_payload.userId

                const user = await prisma.user.findFirst({
                    where: { id: userId },
                })
                if (!user) return done(null, false)

                return done(null, user)
            }
        )
    )
    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser(async (user, done) => {
        return done(null, user!)
    })
}

module.exports = initialize
