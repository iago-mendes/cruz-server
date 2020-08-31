import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import routes from './routes'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

mongoose.connect('mongodb://localhost:27017/cruz', {useNewUrlParser: true, useUnifiedTopology: true})

app.use(routes)

app.listen(1973, () => console.log('server is running'))