import { Request, Response, NextFunction } from 'express'

import Company from '../models/Company'

export default class CompanyController
{
    async create(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = req.body
            Company.create(company)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = req.body
            const tmp = Company.findByIdAndUpdate(req.params.id, company, {new: true})
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async remove(req: Request, res: Response, next: NextFunction)
    {
        try {
            const tmp = Company.findByIdAndDelete(req.params.id)
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async list(req: Request, res: Response, next: NextFunction)
    {
        try {
            const companies = await Company.find()
            return res.json(companies)
        } catch (error) {
            next(error)
        }
    }

    async show(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = await Company.findById(req.params.id)
            return res.json(company)
        } catch (error) {
            next(error)
        }
    }

    async all(req: Request, res: Response, next: NextFunction)
    {
        try {
            const companies = await Company.find()
            return res.json(companies)
        } catch (error) {
            next(error)
        }
    }
}