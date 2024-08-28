import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado - token no encontrado'
        })
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado - token no valida X'
            })
        }
        req.userId = decoded.userId
        next()

    } catch (error) {
        console.log('Error en el middleware verifyToken', error)
        return res.status(500).json({
            success: false,
            message: `No autorizado - token no valida ${error.message}`
        })
    }

}