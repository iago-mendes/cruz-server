import app from './app'

const port = process.env.PORT || 7373
app.listen(port, () => console.log(`<< server started at port ${port} >>`))
