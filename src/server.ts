import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import dotenv from 'dotenv'

import routes from './routes'
import errorHandler from './errors/handler'
import checkKey from './middleware/checkKey'

const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

mongoose.connect(
    'mongodb://localhost:27017/cruz',
    {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}
)
mongoose.connection
.once('open', () => console.log('connection has been made'))
.on('error', error => console.log('[connection error]: ', error))

app.use(checkKey)
app.use(routes)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use(errorHandler)

app.listen(7373, () => console.log('server is running'))