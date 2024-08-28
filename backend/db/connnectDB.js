import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        console.log("mongoUri", process.env.MONGO_URI)
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Esteban se conecto a MongoDB Siiu: ${conn.connection.host}`)
    } catch (error) {
        console.log("Error al conectar con MongoDB", error)
        process.exit(1)
    }
}