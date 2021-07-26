import express from 'express'
import multer from 'multer'

import multerConfig from './config/multer'
import checkKey from './middlewares/checkKey'

import company from './controllers/company'
import product from './controllers/product'
import seller from './controllers/seller'
import client from './controllers/client'
import request from './controllers/request'
import auth from './controllers/auth'
import mail from './controllers/mail'
import pdf from './controllers/pdf'
import productSheet from './controllers/product/sheet'
import clientUtils from './controllers/client/utils'
import {getBanners, sync} from './controllers'
import clientSheet from './controllers/client/sheet'
import companyUtils from './controllers/company/utils'
import {goalController} from './controllers/goal'
import {checkAuth} from './middlewares/auth'

const routes = express.Router()
const upload = multer(multerConfig)

routes.post('/login/client', auth.logInClient)
routes.post('/login/seller', auth.logInSeller)
routes.put(
	'/change-password/client/:client',
	[checkKey, checkAuth],
	auth.changePasswordClient
)
routes.put(
	'/change-password/seller/:seller',
	[checkKey, checkAuth],
	auth.changePasswordSeller
)

routes.post(
	'/companies',
	[checkKey, checkAuth, upload.single('imagem')],
	company.create
)
routes.get('/companies', checkKey, company.list)
routes.get('/companies/raw', checkKey, company.raw)
routes.put(
	'/companies/:id',
	[checkKey, checkAuth, upload.single('imagem')],
	company.update
)
routes.delete('/companies/:id', [checkKey, checkAuth], company.remove)
routes.get('/companies/:id', checkKey, company.show)
routes.get('/companies/:id/raw', checkKey, company.rawOne)
routes.put(
	'/companies/:company/tables',
	[checkKey, checkAuth],
	companyUtils.updateTables
)
routes.get('/companies/:company/tables', checkKey, companyUtils.getTables)
routes.put(
	'/companies/:company/images',
	[checkKey, checkAuth, upload.array('imagens')],
	companyUtils.updateProductsImage
)

routes.post(
	'/companies/:company/products',
	[checkKey, checkAuth, upload.single('imagem')],
	product.create
)
routes.get('/companies/:company/products', checkKey, product.list)
routes.get('/companies/:company/products/priced', checkKey, product.listPriced)
routes.get('/companies/:company/products/raw', checkKey, product.raw)

routes.put(
	'/companies/:company/products/:product',
	[checkKey, checkAuth, upload.single('imagem')],
	product.update
)
routes.delete(
	'/companies/:company/products/:product',
	[checkKey, checkAuth],
	product.remove
)
routes.get('/companies/:company/products/:product', checkKey, product.show)
routes.get(
	'/companies/:company/products/:product/priced',
	checkKey,
	product.showPriced
)
routes.get(
	'/companies/:company/products/:product/raw',
	checkKey,
	product.rawOne
)

routes.post(
	'/sellers',
	[checkKey, checkAuth, upload.single('imagem')],
	seller.create
)
routes.put(
	'/sellers/:id',
	[checkKey, checkAuth, upload.single('imagem')],
	seller.update
)
routes.delete('/sellers/:id', [checkKey, checkAuth], seller.remove)
routes.get('/sellers', checkKey, seller.list)
routes.get('/sellers/:id', checkKey, seller.show)
routes.get('/sellers-raw', checkKey, seller.raw)
routes.get('/sellers-raw/:id', checkKey, seller.rawOne)

routes.post(
	'/clients',
	[checkKey, checkAuth, upload.single('imagem')],
	client.create
)
routes.put(
	'/clients/:id',
	[checkKey, checkAuth, upload.single('imagem')],
	client.update
)
routes.delete('/clients/:id', [checkKey, checkAuth], client.remove)
routes.get('/clients', checkKey, client.list)
routes.get('/clients/:id', checkKey, client.show)
routes.get('/clients-raw', checkKey, client.raw)
routes.get('/clients-raw/:id', checkKey, client.rawOne)

routes.get(
	'/clients/:client/conditions/:company',
	checkKey,
	clientUtils.getConditions
)
routes.post(
	'/clients/:client/contacts',
	[checkKey, checkAuth],
	clientUtils.addContact
)
routes.get('/clients/:client/contacts', checkKey, clientUtils.getContacts)

routes.post('/requests', [checkKey, checkAuth], request.create)
routes.put('/requests/:id', [checkKey, checkAuth], request.update)
routes.delete('/requests/:id', [checkKey, checkAuth], request.remove)
routes.get('/requests', checkKey, request.list)
routes.get('/requests/:id', checkKey, request.show)
routes.get('/requests-raw', checkKey, request.raw)
routes.get('/requests-raw/:id', checkKey, request.rawOne)

routes.post('/mail', [checkKey, checkAuth], mail.general)
routes.post('/mail/contact', checkKey, mail.contact)
routes.post(
	'/mail/requests/:requestId/ecommerce',
	[checkKey, checkAuth],
	mail.ecommerceRequest
)
routes.post(
	'/mail/requests/:requestId/system',
	[checkKey, checkAuth],
	mail.systemRequest
)

routes.post('/pdf', [checkKey, checkAuth], pdf.general)
routes.get('/pdf/requests/:requestId', pdf.request)

routes.get(
	'/sheet/companies/:company/products',
	checkKey,
	productSheet.getProducts
)
routes.post(
	'/sheet/companies/:company/products',
	[checkKey, checkAuth],
	productSheet.setProducts
)
routes.get(
	'/sheet/companies/:company/products/header',
	checkKey,
	productSheet.getHeader
)
routes.get('/sheet/clients/header', checkKey, clientSheet.getHeader)
routes.post('/sheet/clients', [checkKey, checkAuth], clientSheet.setClients)

routes.get('/banners', getBanners)
routes.get('/sync', checkKey, sync)

routes.post('/goals', [checkKey, checkAuth], goalController.create)
routes.get('/goals/raw', [checkKey, checkAuth], goalController.raw)
routes.put('/goals/:month', [checkKey, checkAuth], goalController.update)
routes.delete('/goals/:month', [checkKey, checkAuth], goalController.remove)
routes.get('/goals/:month', [checkKey, checkAuth], goalController.show)
routes.get('/goals/:month/raw', [checkKey, checkAuth], goalController.rawOne)

export default routes
