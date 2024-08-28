import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route.js'
import cookieParser from 'cookie-parser'
import { connectDB } from './db/connnectDB.js'
import cors from 'cors'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes )

app.listen(PORT, () => {
    connectDB()
    console.log(`Esteban el server esta corriendo en el puerto: ${PORT} `)
})
