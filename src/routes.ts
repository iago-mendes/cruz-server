import express from 'express'
import multer from 'multer'

import multerConfig from './config/multer'
import checkKey from './middleware/checkKey'

import company from './controllers/company'
import product from './controllers/product'
import seller from './controllers/seller'
import client from './controllers/client'
import request from './controllers/request'
import auth from './controllers/auth'
import line from './controllers/line'

const routes = express.Router()
const upload = multer(multerConfig)

routes.post('/login/client', auth.logInClient)
routes.post('/login/seller', auth.logInSeller)

routes.post('/companies', [checkKey, upload.single('imagem')], company.create)
routes.put('/companies/:id', [checkKey, upload.single('imagem')], company.update)
routes.delete('/companies/:id', checkKey, company.remove)
routes.get('/companies', checkKey, company.list)
routes.get('/companies/:id', checkKey, company.show)
routes.get('/companies-all', checkKey, company.all)
routes.get('/companies-all/:id', checkKey, company.allOne)

routes.post('/companies/:id/lines', [checkKey, upload.single('imagem')], line.create)
routes.put('/companies/:id/lines/:line', [checkKey, upload.single('imagem')], line.update)
routes.delete('/companies/:id/lines/:line', checkKey, line.remove)
routes.get('/companies/:id/lines', checkKey, line.list)

routes.post('/companies/:id/lines/:line/products', [checkKey, upload.single('imagem')], product.create)
routes.put('/companies/:id/lines/:line/products/:product', [checkKey, upload.single('imagem')], product.update)
routes.delete('/companies/:id/lines/:line/products/:product', checkKey, product.remove)
routes.get('/companies/:id/lines/:line/products', checkKey, product.list)
routes.get('/companies/:id/products-priced', checkKey, product.listPriced)
routes.get('/companies/:id/lines/:line/products-priced/:product', checkKey, product.showPriced)
routes.get('/companies/:id/lines/:line/products/:product', checkKey, product.show)
routes.get('/companies/:id/lines/:line/products-raw', checkKey, product.raw)
routes.get('/companies/:id/lines/:line/products-raw/:product', checkKey, product.rawOne)

routes.post('/sellers', [checkKey, upload.single('imagem')], seller.create)
routes.put('/sellers/:id', [checkKey, upload.single('imagem')], seller.update)
routes.delete('/sellers/:id', checkKey, seller.remove)
routes.get('/sellers', checkKey, seller.list)
routes.get('/sellers/:id', checkKey, seller.show)
routes.get('/sellers-raw', checkKey, seller.raw)
routes.get('/sellers-raw/:id', checkKey, seller.rawOne)

routes.post('/clients', [checkKey, upload.single('imagem')], client.create)
routes.put('/clients/:id', [checkKey, upload.single('imagem')], client.update)
routes.delete('/clients/:id', checkKey, client.remove)
routes.get('/clients', checkKey, client.list)
routes.get('/clients/:id', checkKey, client.show)
routes.get('/clients-raw', checkKey, client.raw)
routes.get('/clients-raw/:id', checkKey, client.rawOne)
routes.get('/clients/:client/conditions/:company', checkKey, client.getConditions)

routes.post('/requests', checkKey, request.create)
routes.put('/requests/:id', checkKey, request.update)
routes.delete('/requests/:id', checkKey, request.remove)
routes.get('/requests', checkKey, request.list)
routes.get('/requests/:id', checkKey, request.show)
routes.get('/requests-raw', checkKey, request.raw)
routes.get('/requests-raw/:id', checkKey, request.rawOne)

export default routes