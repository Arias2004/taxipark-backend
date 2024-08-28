import { generateVerificationToken } from '../utils/generateVerificationToken.js'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js'
import { User } from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const register = async (req, res) => {
    const { email, password, name } = req.body
    try {

        if (!email || !password || !name) {
            throw new Error('Faltan rellenar todos los campos')
        }

        const userAlreadyExist = await User.findOne({ email })
        if (userAlreadyExist) {
            return res.status(400).json({ succes: false, message: 'El email ya tiene una cuenta vinculada' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const verificationToken = await generateVerificationToken()

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        })

        await user.save()

        generateTokenAndSetCookie(res, user._id)

        await sendVerificationEmail(user.email, verificationToken)

        res.status(200).json({
            succes: true,
            message: 'Usuario registrado correctamente',
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log('Error al registrar el usuario', error)
        res.status(500).json({ succes: false, message: `Error al registrar el usuario ${error.message}` })
    }
}

export const verifyEmail = async (req, res) => {

    const { code } = req.body

    try {

        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({
                succes: false,
                message: 'El código de verificación no es válido o ha expirado'
            })
        }

        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined

        await user.save()

        await sendWelcomeEmail(user.email, user.name)

        res.status(200).json({
            succes: true,
            message: 'Email verificado correctamente',
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log('Error al enviar el email de verificación', error)

        res.status(500).json({
            succes: false,
            message: `Error al enviar el email de verificación ${error.message}`
        })
    }

}

export const login = async (req, res) => {

    const { email, password } = req.body

    try {

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                succes: false,
                message: 'El correo utilizado no tiene una cuenta registrada'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({
                succes: false,
                message: 'La contraseña introducida es incorrecta'
            })
        }

        generateTokenAndSetCookie(res, user._id)

        user.lastLogin = Date.now()

        await user.save()

        res.status(200).json({
            succes: true,
            message: 'Sesión iniciada correctamente',
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log('Error al iniciar sesión', error)
        res.status(500).json({
            succes: false,
            message: `Error al iniciar sesión ${error.message}`
        })

    }
}

export const logout = async (req, res) => {

    res.clearCookie('token')
    res.status(200).json({
        succes: true,
        message: 'Sesión cerrada correctamente'
    })

}

export const forgotPassword = async (req, res) => {

    const { email } = req.body

    try {

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                succes: false,
                message: 'El correo utilizado no tiene una cuenta registrada'
            })
        }

        const tokenReset = crypto.randomBytes(20).toString('hex')

        const resetTokenExpiresAt = Date.now() + 5 * 60 * 1000

        user.resetPasswordToken = tokenReset
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save()

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${tokenReset}`)

        res.status(200).json({
            succes: true,
            message: 'Se ha enviado correctamente el email de restablecimiento de contraseña'
        })

    } catch (error) {
        console.log('Error al enviar el email de restablecimiento de contraseña', error)
        res.status(500).json({
            succes: false,
            message: `Error al enviar el email de restablecimiento de contraseña ${error.message}`
        })
    }

}

export const resetPassword = async (req, res) => {

    try {

        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })
        if (!user) {
            return res.status(400).json({
                succes: false,
                message: 'El token de restablecimiento no es válido o ha expirado'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined

        await user.save()

        await sendResetSuccessEmail(user.email)

        res.status(200).json({
            succes: true,
            message: 'Se ha restablecido correctamente la contraseña'
        })

    } catch (error) {
        console.log('Error al restablecer la contraseña', error)
        res.status(500).json({
            succes: false,
            message: `Error al restablecer la contraseña ${error.message}`
        })
    }

}

export const checkAuth = async (req, res) => {

    try {
        
        const user = await User.findById(req.userId).select('-password')
        if (!user) {
            return res.status(400).json({
                succes: false,
                message: 'Usuario no encontrado o sesión caducada'
            })
        }

        res.status(200).json({
            succes: true,
            message: 'Usuario verificado correctamente',
            user
        })

    } catch (error) {
        console.log('Error al verificar la autenticación', error)
        res.status(400).json({
            succes: false,
            message: `Error al verificar la autenticación ${error.message}`
        })
    }

}

