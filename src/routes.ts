import express from 'express'

const routes = express.Router()

import CompanyController from './controllers/CompanyController'
import SellerController from './controllers/SellerController'

const Company = new CompanyController()
const Seller = new SellerController()

routes.post('/companies', Company.create)
routes.put('/companies/:id', Company.update)
routes.delete('/companies/:id', Company.remove)
routes.get('/companies', Company.list)
routes.get('/companies/:id', Company.show)

routes.post('/sellers', Seller.create)
routes.put('/sellers/:id', Seller.update)
routes.delete('/sellers/:id', Seller.remove)
routes.get('/sellers', Seller.list)
routes.get('/sellers/:id', Seller.show)

export default routes