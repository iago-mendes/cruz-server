import mongoose from 'mongoose'
import { Request, Response } from 'express'

import { Company } from '../models/Company'

// const Representada = mongoose.get('Representada')

export default class CompanyController
{
    async create(req: Request, res: Response)
    {
        const {} = req.body
        const company = {}
        Company.create(company)
        res.status(201).send()
    }

    async update(req: Request, res: Response)
    {
        const {} = req.body
        const company = {}
        Company.findByIdAndUpdate(req.params.id, company, {new: true})
        res.status(200).send()
    }

    async remove(req: Request, res: Response)
    {
        Company.findByIdAndDelete(req.params.id)
    }

    async list(req: Request, res: Response)
    {
        const companies = await Company.find()
        return res.json(companies)
    }

    async show(req: Request, res: Response)
    {
        const company = await Company.findById(req.params.id)
        return res.json(company)
    }
}