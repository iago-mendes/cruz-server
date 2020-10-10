import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import routes from './routes'
import { dbName, password } from './config/db'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

mongoose.connect(
    `mongodb+srv://admin:${password}@cluster0.c7b5n.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}
)
mongoose.connection
.once('open', () => console.log('connection has been made'))
.on('error', error => console.log('[connection error]: ', error))

import './models/Company'

app.use(routes)

app.listen(1973, () => console.log('server is running'))