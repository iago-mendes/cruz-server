import express from 'express'
import multer from 'multer'

const routes = express.Router()

import multerConfig from './config/multer'
const upload = multer(multerConfig)

import CompanyController from './controllers/CompanyController'
import ProductController from './controllers/ProductController'
import SellerController from './controllers/SellerController'
import ClientController from './controllers/ClientController'
import RequestController from './controllers/RequestController'
import AuthController from './controllers/AuthController'

const Company = new CompanyController()
const Product = new ProductController()
const Seller = new SellerController()
const Client = new ClientController()
const Request = new RequestController()

routes.post('/login/client', AuthController.logInClient)
routes.post('/login/seller', AuthController.logInSeller)

routes.post(
	'/companies',
	upload.fields([{name: 'imagem', maxCount: 1}, {name: 'imagens_linhas'}, {name: 'imagens_produtos'}]),
	Company.create
)
routes.put('/companies/:id', upload.single('imagem'), Company.update)
routes.delete('/companies/:id', Company.remove)
routes.get('/companies', Company.list)
routes.get('/companies/:id', Company.show)
routes.get('/companies-all', Company.all)
routes.get('/companies-all/:id', Company.allOne)

routes.get('/companies/:id/products', Product.listLines)
routes.put('/companies/:id/products/:line', upload.single('imagem'), Product.updateLine)
routes.get('/companies/:id/products/:line', Product.listProducts)
routes.get('/companies/:id/products-priced/:line', Product.listPricedProducts)
routes.get('/companies/:id/products-priced/:line/:product', Product.showPricedProduct)
routes.get('/companies/:id/products/:line/:product', Product.showProduct)
routes.put('/companies/:id/products/:line/:product', upload.single('imagem'), Product.updateProduct)

routes.post('/sellers', upload.single('imagem'), Seller.create)
routes.put('/sellers/:id', upload.single('imagem'), Seller.update)
routes.delete('/sellers/:id', Seller.remove)
routes.get('/sellers', Seller.list)
routes.get('/sellers/:id', Seller.show)
routes.get('/sellers-all', Seller.all)

routes.post('/clients', upload.single('imagem'), Client.create)
routes.put('/clients/:id', upload.single('imagem'), Client.update)
routes.delete('/clients/:id', Client.remove)
routes.get('/clients', Client.list)
routes.get('/clients/:id', Client.show)
routes.get('/clients-all', Client.all)

routes.post('/requests', Request.create)
routes.put('/requests/:id', Request.update)
routes.delete('/requests/:id', Request.remove)
routes.get('/requests', Request.list)
routes.get('/requests/:id', Request.show)
routes.get('/requests-all', Request.all)

export default routes