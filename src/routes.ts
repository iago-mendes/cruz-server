import express from 'express'
import multer from 'multer'

import multerConfig from './config/multer'
import checkKey from './middleware/checkKey'

import CompanyController from './controllers/CompanyController'
import ProductController from './controllers/ProductController'
import SellerController from './controllers/SellerController'
import ClientController from './controllers/ClientController'
import RequestController from './controllers/RequestController'
import AuthController from './controllers/AuthController'
import Line from './controllers/LineController'

const routes = express.Router()
const upload = multer(multerConfig)

const Company = new CompanyController()
const Product = new ProductController()
const Seller = new SellerController()
const Client = new ClientController()
const Request = new RequestController()

routes.post('/login/client', AuthController.logInClient)
routes.post('/login/seller', AuthController.logInSeller)

routes.post('/companies', [checkKey, upload.single('imagem')], Company.create)
routes.put('/companies/:id', [checkKey, upload.single('imagem')], Company.update)
routes.delete('/companies/:id', checkKey, Company.remove)
routes.get('/companies', checkKey, Company.list)
routes.get('/companies/:id', checkKey, Company.show)
routes.get('/companies-all', checkKey, Company.all)
routes.get('/companies-all/:id', checkKey, Company.allOne)

routes.post('/companies/:id/lines', [checkKey, upload.single('imagem')], Line.create)
routes.put('/companies/:id/lines/:line', [checkKey, upload.single('imagem')], Line.update)
routes.delete('/companies/:id/lines/:line', checkKey, Line.remove)
routes.get('/companies/:id/lines', checkKey, Line.list)

routes.post('/companies/:id/lines/:line/products', [checkKey, upload.single('imagem')], Product.create)
routes.put('/companies/:id/lines/:line/products/:product', [checkKey, upload.single('imagem')], Product.update)
routes.delete('/companies/:id/lines/:line/products/:product', checkKey, Product.remove)
routes.get('/companies/:id/lines/:line/products', checkKey, Product.list)
routes.get('/companies/:id/lines/:line/products-priced', checkKey, Product.listPriced)
routes.get('/companies/:id/lines/:line/products-priced/:product', checkKey, Product.showPriced)
routes.get('/companies/:id/lines/:line/products/:product', checkKey, Product.show)
routes.get('/companies/:id/lines/:line/products-raw', checkKey, Product.raw)

routes.post('/sellers', [checkKey, upload.single('imagem')], Seller.create)
routes.put('/sellers/:id', [checkKey, upload.single('imagem')], Seller.update)
routes.delete('/sellers/:id', checkKey, Seller.remove)
routes.get('/sellers', checkKey, Seller.list)
routes.get('/sellers/:id', checkKey, Seller.show)
routes.get('/sellers-all', checkKey, Seller.all)

routes.post('/clients', [checkKey, upload.single('imagem')], Client.create)
routes.put('/clients/:id', [checkKey, upload.single('imagem')], Client.update)
routes.delete('/clients/:id', checkKey, Client.remove)
routes.get('/clients', checkKey, Client.list)
routes.get('/clients/:id', checkKey, Client.show)
routes.get('/clients-all', checkKey, Client.all)

routes.post('/requests', checkKey, Request.create)
routes.put('/requests/:id', checkKey, Request.update)
routes.delete('/requests/:id', checkKey, Request.remove)
routes.get('/requests', checkKey, Request.list)
routes.get('/requests/:id', checkKey, Request.show)
routes.get('/requests-all', checkKey, Request.all)

export default routes