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
import auth from './middleware/authJwt'

const Company = new CompanyController()
const Product = new ProductController()
const Seller = new SellerController()
const Client = new ClientController()
const Request = new RequestController()

routes.post('/login/client', AuthController.logInClient)
routes.post('/login/seller', AuthController.logInSeller)

routes.post(
    '/companies',
    [auth.verifyToken, auth.isAdmin, upload.fields([{name: 'imagem', maxCount: 1}, {name: 'imagens_linhas'}, {name: 'imagens_produtos'}])],
    Company.create
)
routes.put('/companies/:id', [auth.verifyToken, auth.isAdmin, upload.single('imagem')], Company.update)
routes.delete('/companies/:id', [auth.verifyToken, auth.isAdmin], Company.remove)
routes.get('/companies', auth.verifyToken, Company.list)
routes.get('/companies/:id', auth.verifyToken, Company.show)
routes.get('/companies-all', auth.verifyToken, Company.all)
routes.get('/companies-all/:id', auth.verifyToken, Company.allOne)

routes.get('/companies/:id/products', auth.verifyToken, Product.listLines)
routes.put('/companies/:id/products/:line', [auth.verifyToken, auth.isAdmin, upload.single('imagem')], Product.updateLine)
routes.get('/companies/:id/products/:line', [auth.verifyToken], Product.listProducts)
routes.get('/companies/:id/products-priced/:line', [auth.verifyToken], Product.listPricedProducts)
routes.get('/companies/:id/products-priced/:line/:product', [auth.verifyToken], Product.showPricedProduct)
routes.get('/companies/:id/products/:line/:product', [auth.verifyToken, auth.isSeller], Product.showProduct)
routes.put('/companies/:id/products/:line/:product', [auth.verifyToken, auth.isAdmin, upload.single('imagem')], Product.updateProduct)

routes.post('/sellers', [auth.verifyToken, auth.isAdmin, upload.single('imagem')], Seller.create)
routes.put('/sellers/:id', [auth.verifyToken, auth.isAdmin, upload.single('imagem')], Seller.update)
routes.delete('/sellers/:id', [auth.verifyToken, auth.isAdmin], Seller.remove)
routes.get('/sellers', Seller.list)
routes.get('/sellers/:id', [auth.verifyToken, auth.isAdmin], Seller.show)
routes.get('/sellers-all', [auth.verifyToken, auth.isAdmin], Seller.all)

routes.post('/clients', [auth.verifyToken, auth.isAdmin, upload.single('imagem')], Client.create)
routes.put('/clients/:id', [auth.verifyToken, auth.isAdmin, upload.single('imagem')], Client.update)
routes.delete('/clients/:id', [auth.verifyToken, auth.isAdmin], Client.remove)
routes.get('/clients', [auth.verifyToken, auth.isSeller], Client.list)
routes.get('/clients/:id', [auth.verifyToken, auth.isSeller], Client.show)
routes.get('/clients-all', [auth.verifyToken, auth.isSeller], Client.all)

routes.post('/requests', [auth.verifyToken, auth.isSeller], Request.create)
routes.put('/requests/:id', [auth.verifyToken, auth.isSeller], Request.update)
routes.delete('/requests/:id', [auth.verifyToken, auth.isSeller], Request.remove)
routes.get('/requests', [auth.verifyToken, auth.isSeller], Request.list)
routes.get('/requests/:id', [auth.verifyToken, auth.isSeller], Request.show)
routes.get('/requests-all', [auth.verifyToken, auth.isSeller], Request.all)

export default routes