import { PrismaClient, User } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { PassportStatic } from 'passport'
import Blacklist from '../enums/Blacklist'

const prisma = new PrismaClient()

export const jwtCheck = (passport: PassportStatic) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user) return next()

        passport.authenticate(
            'jwt',
            { session: false },
            async (err: any, user: User, info: any) => {
                if (err)
                    return res.json({
                        ok: false,
                        errorMsg: 'Error during the authentication.',
                    })

                // Check auth
                if (req.headers.authorization) {
                    let blacklistTokensDb = await prisma.blacklist.findFirst({
                        where: {
                            type: Blacklist.Token,
                        },
                    })
                    if (!blacklistTokensDb)
                        blacklistTokensDb = await prisma.blacklist.create({
                            data: {
                                type: Blacklist.Token,
                                data: { tokens: [] },
                            },
                        })
                    const blacklistTokens: any = blacklistTokensDb.data

                    const token: string = req.headers.authorization
                    const jwtCode = token.replace('Bearer ', '')

                    if (blacklistTokens.tokens.includes(jwtCode))
                        return res.json({
                            ok: false,
                            errorMsg: 'JWT token is invalid.',
                        })
                }

                if (!user)
                    return res.json({
                        ok: false,
                        errorMsg: 'JWT token is invalid.',
                    })

                const newUser: User = (await prisma.user.findFirst({
                    where: { id: user.id },
                    include: { articles: true },
                }))!
                req.user = newUser
                next()
            }
        )(req, res, next)
    }
}
