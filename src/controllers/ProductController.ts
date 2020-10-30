import { Request, Response, NextFunction } from 'express'

import Company from '../models/Company'
import baseUrl from '../config/baseUrl'

export default class ProductController
{
    async getLines(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = await Company.findById(req.params.id)
            return res.json(company?.linhas)
        } catch (error) {
            next(error)
        }
    }
}