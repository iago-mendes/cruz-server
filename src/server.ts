import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import dotenv from 'dotenv'
import 'express-async-errors'

import routes from './routes'
import errorHandler from './errors/handler'

const app = express()
dotenv.config({path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'})

app.use(cors({origin: '*', exposedHeaders: '*'}))
app.use(express.json({limit: '500mb'}))
app.use(express.urlencoded({extended: true, limit: '500mb'}))

mongoose.connect(
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
mongoose.connection
	.once('open', () => console.log('database connected'))
	.on('error', error => console.log('[database connection error]:', error))

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use('/public', express.static(path.join(__dirname, '..', 'public')))

app.use(routes)
app.use(errorHandler)

const port = 7373
app.listen(port, () => console.log('server started at port', port))
