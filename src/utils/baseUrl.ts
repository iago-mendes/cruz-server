import dotenv from 'dotenv'
dotenv.config()

const baseUrl = String(process.env.BASE_URL)

export default baseUrl