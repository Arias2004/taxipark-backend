import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }]

    try {
        const res = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verifica tu cuenta",
            html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationToken),
            category: "Email Verification",
        })

        console.log('Email de verificación enviado con éxito', res)

    } catch (error) {
        console.log('Error al enviar el email', error);
        throw new Error(`Error al enviar el email ${error}`)
    }
}

export const sendWelcomeEmail = async (email, name) => {

    const recipient = [{ email }]

    try {

        const res = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "4b67b765-875f-48d0-82e7-b6d043192715",
            template_variables: {
                company_info_name: "Sabata",
                name: name
            }
        })

        console.log('Email de bienvenida enviado con éxito', res)

    } catch (error) {

        console.log('Error al enviar el email de bienvenida', error)

        throw new Error(`Error al enviar el email de bienvenida ${error}`)

    }

}

export const sendPasswordResetEmail = async (email, resetURL) => {

    const recipient = [{ email }]

    try {

        const res = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Restablecer contraseña",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
            category: "Password Reset",
        })

    } catch (error) {
        console.log('Error al enviar el email de restablecimiento de contraseña', error)
        throw new Error(`Error al enviar el email de restablecimiento de contraseña ${error}`)
    }

}

export const sendResetSuccessEmail = async (email) => {

    const recipient = [{ email }]

    try {

        const res = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Restablecimiento de contraseña exitoso",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset",
        })

        console.log('Email de restablecimiento de contraseña exitoso enviado con éxito', res)

    } catch (error) {
        console.log('Error al enviar el email de restablecimiento de contraseña exitoso', error)
        throw new Error(`Error al enviar el email de restablecimiento de contraseña exitoso ${error}`)
    }

}