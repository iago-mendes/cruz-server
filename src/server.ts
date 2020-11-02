import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'

import routes from './routes'
import { dbName, password } from './config/db'
import errorHandler from './errors/handler'

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

app.use(function(req, res, next)
{
    res.header("Access-Control-Allow-Headers", "token, Origin, Content-Type, Accept, id")
    next()
})
app.use(routes)

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use(errorHandler)

app.listen(1973, () => console.log('server is running'))