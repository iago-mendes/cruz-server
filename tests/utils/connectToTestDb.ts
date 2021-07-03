import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({path: '.env.test'})

export async function connectToTestDb() {
	await mongoose.connect(
		`mongodb://localhost:27017/${process.env.DB_NAME}?authSource=admin`,
		{
			user: process.env.DB_USER,
			pass: process.env.DB_PWD,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true
		}
	)

	return mongoose.connection
}
