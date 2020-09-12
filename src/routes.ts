import express from 'express'

const routes = express.Router()

import CompanyController from './controllers/CompanyController'

const Company = new CompanyController()

routes.post('/companies', Company.create)
routes.put('/companies/:id', Company.update)
routes.delete('/companies/:id', Company.remove)
routes.get('/companies', Company.list)
routes.get('/companies/:id', Company.show)

export default routes