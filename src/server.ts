import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

mongoose.connect('mongodb://localhost:27017/cruz', {useNewUrlParser: true})

app.listen(1973, () => console.log('server is running'))