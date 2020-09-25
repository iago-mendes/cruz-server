import express from 'express'

const routes = express.Router()

import CompanyController from './controllers/CompanyController'
import SellerController from './controllers/SellerController'
import ClientController from './controllers/ClientController'
import RequestController from './controllers/RequestController'

const Company = new CompanyController()
const Seller = new SellerController()
const Client = new ClientController()
const Request = new RequestController()

routes.post('/companies', Company.create)
routes.put('/companies/:id', Company.update)
routes.delete('/companies/:id', Company.remove)
routes.get('/companies', Company.list)
routes.get('/companies/:id', Company.show)
routes.get('/companies-all', Company.all)

routes.post('/sellers', Seller.create)
routes.put('/sellers/:id', Seller.update)
routes.delete('/sellers/:id', Seller.remove)
routes.get('/sellers', Seller.list)
routes.get('/sellers/:id', Seller.show)
routes.get('/sellers-all', Seller.all)

routes.post('/clients', Client.create)
routes.put('/clients/:id', Client.update)
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