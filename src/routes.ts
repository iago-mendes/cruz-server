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
import mail from './controllers/mail'
import pdf from './controllers/pdf'
import productSheet from './controllers/product/sheet'
import clientUtils from './controllers/client/utils'
import {getBanners} from './controllers'
import clientSheet from './controllers/client/sheet'
import companyUtils from './controllers/company/utils'

const routes = express.Router()
const upload = multer(multerConfig)

routes.post('/login/client', auth.logInClient)
routes.post('/login/seller', auth.logInSeller)
routes.put('/change-password/client/:client', checkKey, auth.changePasswordClient)
routes.put('/change-password/seller/:seller', checkKey, auth.changePasswordSeller)

routes.post('/companies', [checkKey, upload.single('imagem')], company.create)
routes.get('/companies', checkKey, company.list)
routes.get('/companies/raw', checkKey, company.raw)
routes.put('/companies/:id', [checkKey, upload.single('imagem')], company.update)
routes.delete('/companies/:id', checkKey, company.remove)
routes.get('/companies/:id', checkKey, company.show)
routes.get('/companies/:id/raw', checkKey, company.rawOne)
routes.put('/companies/:company/tables', checkKey, companyUtils.updateTables)
routes.get('/companies/:company/tables', checkKey, companyUtils.getTables)

routes.post('/companies/:company/products', [checkKey, upload.single('imagem')], product.create)
routes.get('/companies/:company/products', checkKey, product.list)
routes.get('/companies/:company/products/priced', checkKey, product.listPriced)
routes.get('/companies/:company/products/raw', checkKey, product.raw)

routes.put('/companies/:company/products/:product', [checkKey, upload.single('imagem')], product.update)
routes.delete('/companies/:company/products/:product', checkKey, product.remove)
routes.get('/companies/:company/products/:product', checkKey, product.show)
routes.get('/companies/:company/products/:product/priced', checkKey, product.showPriced)
routes.get('/companies/:company/products/:product/raw', checkKey, product.rawOne)

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

routes.get('/clients/:client/conditions/:company', checkKey, clientUtils.getConditions)
routes.post('/clients/:client/contacts', checkKey, clientUtils.addContact)
routes.get('/clients/:client/contacts', checkKey, clientUtils.getContacts)

routes.post('/requests', checkKey, request.create)
routes.put('/requests/:id', checkKey, request.update)
routes.delete('/requests/:id', checkKey, request.remove)
routes.get('/requests', checkKey, request.list)
routes.get('/requests/:id', checkKey, request.show)
routes.get('/requests-raw', checkKey, request.raw)
routes.get('/requests-raw/:id', checkKey, request.rawOne)

routes.post('/mail/requests/:requestId/ecommerce', checkKey, mail.ecommerceRequest)
routes.post('/mail/requests/system', checkKey, mail.systemRequest)
routes.post('/mail', checkKey, mail.general)

routes.post('/pdf', checkKey, pdf.general)
routes.get('/pdf/requests/:requestId', pdf.request)

routes.get('/sheet/companies/:company/products', checkKey, productSheet.getProducts)
routes.post('/sheet/companies/:company/products', checkKey, productSheet.setProducts)
routes.get('/sheet/companies/:company/products/header', checkKey, productSheet.getHeader)
routes.get('/sheet/clients/header', checkKey, clientSheet.getHeader)
routes.post('/sheet/clients', checkKey, clientSheet.setClients)

routes.get('/banners', getBanners)

export default routes