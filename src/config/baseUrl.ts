import dotenv from 'dotenv'
dotenv.config()

export default String(process.env.BASE_URL)