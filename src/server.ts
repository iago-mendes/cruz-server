import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import routes from './routes'
import { url } from './credentials'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connection
.once('open', () => console.log('connection has been made'))
.on('error', error => console.log('[connection error]: ', error))

import './models/Company'

app.use(routes)

app.listen(1973, () => console.log('server is running'))