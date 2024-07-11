import { Blacklist as BlackListDB, PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import Blacklist from './enums/Blacklist'
import { jwtCheck } from './middlewares/jwtCheck'
dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT: number = +process.env.PORT! || 3000

// express middleware
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
)
app.use(passport.initialize())
app.use(passport.session())

// Passport init
const initializePassport = require('./passport-config')
initializePassport(passport, async (email: string) => {
    const user = await prisma.user.findFirst({
        where: { email },
        include: {
            articles: true,
        },
    })

    return user
})

app.get('/api/articles', async (req, res) => {
    const articles = await prisma.article.findMany({
        include: { author: true },
    })

    res.status(200).json(articles)
})

// Auth/User
app.get('/api/@me', jwtCheck(passport), (req, res) => {
    const user = req.user as User
    if (user.imageBytes)
        user.imageUrl = `${user.imageUrl}${user.imageBytes.toString('base64')}`

    res.json({ ok: true, user: user })
})

app.post('/api/login', (req, res, next) =>
    passport.authenticate('local', {}, (err: any, user: User, info: any) => {
        if (err) return res.json({ ok: false, errorMsg: err })

        if (!user)
            return res.json({
                ok: false,
                errorMsg: 'No users with this email.',
            })

        req.logIn(user, (err) => {
            if (err) return res.json({ ok: false, errorMsg: err })

            return res.json({
                ok: true,
                user: user,
                token: jwt.sign(
                    { userId: user.id, username: user.username },
                    process.env.JWT_SECRET!,
                    { expiresIn: '1w' }
                ),
            })
        })
    })(req, res, next)
)
app.post('/api/register', async (req, res) => {
    const email: string = req.body.email
    const username: string = req.body.username
    const imageUrl: string =
        'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png'

    const passwordRaw: string = req.body.password
    const password: string = await bcrypt.hash(passwordRaw, 10)

    // Check email
    const emailUser = await prisma.user.findFirst({ where: { email } })
    if (emailUser)
        return res.json({ ok: false, errorMsg: 'This email is already used.' })

    const user = await prisma.user.create({
        data: {
            email,
            password,
            imageUrl,
            username,
        },
    })
    if (!user) return res.json({ ok: false, errorMsg: 'Thre was an error.' })

    res.status(200).json({ ok: true, user })
})
app.delete('/api/logout', jwtCheck(passport), async (req, res) => {
    if (req.headers.authorization) {
        const token: string = req.headers.authorization
        const jwtCode = token.replace('Bearer ', '')

        if (jwtCode) {
            const blacklist = await prisma.blacklist.findFirst({
                where: { type: Blacklist.Token },
            })
            if (!blacklist)
                await prisma.blacklist.create({
                    data: {
                        type: Blacklist.Token,
                        data: {
                            tokens: [jwtCode],
                        },
                    },
                })
            else {
                interface ExtendedBlacklist extends BlackListDB {
                    data: {
                        tokens: string[]
                    }
                }
                const blacklistData: ExtendedBlacklist =
                    blacklist as unknown as ExtendedBlacklist

                const result = await prisma.blacklist.update({
                    where: { id: blacklist.id },
                    data: {
                        data: {
                            tokens: [...blacklistData.data.tokens, jwtCode],
                        },
                    },
                })
            }
        }
    }

    req.logOut(() => {})
    res.json({ ok: true })
})

// Update user
app.post('/api/2fa', jwtCheck(passport), async (req, res) => {
    const user = req.user as User

    await prisma.user.update({
        where: { id: user.id },
        data: { TwoFA: !user.TwoFA },
    })

    return res.json({ ok: true })
})
app.post('/api/password', jwtCheck(passport), async (req, res) => {
    const user = req.user as User

    const currentPassword: string | undefined = req.body.currentPassword
    const newPassword: string | undefined = req.body.newPassword
    const confirmPassword: string | undefined = req.body.confirmPassword

    if (!currentPassword || !newPassword || !confirmPassword)
        return res.json({
            ok: false,
            errorMsg: 'You did not provide an argument with the request.',
        })
    if (confirmPassword !== newPassword)
        return res.json({
            ok: false,
            errorMsg:
                'The new password is not the same as the confirmation password.',
        })
    if (!(await bcrypt.compare(currentPassword, user.password)))
        return res.json({ ok: false, errorMsg: 'The password is wrong.' })
    const cryptPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { id: user.id },
        data: { password: cryptPassword },
    })

    return res.json({ ok: true })
})
app.patch('/api/settings', jwtCheck(passport), async (req, res) => {
    const type: string = req.body.type
    const user = req.user as User

    if (type === 'UPDATE_USER_PROFILE') {
        const { username, email, imageUrl } = req.body.userData as {
            username: string | undefined
            email: string | undefined
            imageUrl: { type: string; image: Buffer }
        }
        const data: {
            username?: string | any
            email?: string | any
            imageUrl?: String | {} | any
            imageBytes?: Buffer
        } = {}

        if (username && typeof username === 'string') data.username = username
        if (email && typeof email === 'string') data.email = email
        if (imageUrl && imageUrl.image) {
            imageUrl.image = Buffer.from(imageUrl.image)
            console.log(imageUrl.image)

            data.imageBytes = imageUrl.image
            data.imageUrl = `${imageUrl.type}${imageUrl.image.toString(
                'base64'
            )}`
        }

        await prisma.user.update({ where: { id: user.id }, data })

        // output
        return res.json({ ok: true, user: user })
    }

    res.json({ ok: false, errorMsg: 'Invalid type' })
})

// create
app.post('/api/create', jwtCheck(passport), async (req, res) => {
    const { imageUrl, title, subtitle, description, creationDate, authorId } =
        req.body

    if (
        !imageUrl ||
        !title ||
        !subtitle ||
        !description ||
        !creationDate ||
        !authorId
    )
        return res.json({ ok: false, errorMsg: 'Args missing.' })

    const user = await prisma.user.findFirst({ where: { id: authorId } })
    if (!user)
        return res.json({ ok: false, errorMsg: "This user doesn't exist." })

    const article = await prisma.article.create({
        data: {
            imageUrl,
            title,
            subtitle,
            description,
            creationDate,
            author: { connect: user },
        },
    })
    res.json({ ok: true, article })
})

app.listen(PORT, () => {
    console.log(`Running on the port ${PORT}`)
})
