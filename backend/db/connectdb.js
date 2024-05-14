import mongoose from "mongoose"

const connectMongoDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL)
        console.log(`MongoDB connected: ${connection.connection.host}`)
    } catch (error) {
       console.log(`Error Connection to mongodb: ${error.message}`) 
       process.exit(1)
    }
}

export default connectMongoDb