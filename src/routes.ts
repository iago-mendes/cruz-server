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

routes.post(
	'/companies',
	[checkKey, upload.fields([{name: 'imagem', maxCount: 1}, {name: 'imagens_linhas'}, {name: 'imagens_produtos'}])],
	Company.create
)
routes.put('/companies/:id', [checkKey, upload.single('imagem')], Company.update)
routes.delete('/companies/:id', checkKey, Company.remove)
routes.get('/companies', checkKey, Company.list)
routes.get('/companies/:id', checkKey, Company.show)
routes.get('/companies-all', checkKey, Company.all)
routes.get('/companies-all/:id', checkKey, Company.allOne)

routes.post('/companies/:id/lines', [checkKey, upload.single('imagem')], Line.create)
routes.get('/companies/:id/lines', checkKey, Line.list)
routes.put('/companies/:id/lines/:line', [checkKey, upload.single('imagem')], Line.update)

routes.get('/companies/:id/products/:line', checkKey, Product.listProducts)
routes.get('/companies/:id/products-priced/:line', checkKey, Product.listPricedProducts)
routes.get('/companies/:id/products-priced/:line/:product', checkKey, Product.showPricedProduct)
routes.get('/companies/:id/products/:line/:product', checkKey, Product.showProduct)
routes.put('/companies/:id/products/:line/:product', [checkKey, upload.single('imagem')], Product.updateProduct)

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