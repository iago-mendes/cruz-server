import { Request, Response, NextFunction, request } from 'express'

import { Request as RequestModel } from '../models/Request'

export default class RequestController
{
    async create(req: Request, res: Response, next: NextFunction)
    {
        try {
            const request = req.body
            await RequestModel.create(request)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction)
    {
        try {
            const request = req.body
            const tmp = await RequestModel.findByIdAndUpdate(req.params.id, request, {new: true})
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async remove(req: Request, res: Response, next: NextFunction)
    {
        try {
            const tmp = await RequestModel.findByIdAndDelete(req.params.id)
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async list(req: Request, res: Response, next: NextFunction)
    {
        try {
            const requests = await RequestModel.find()
            return res.json(requests)
        } catch (error) {
            next(error)
        }
    }

    async show(req: Request, res: Response, next: NextFunction)
    {
        try {
            const request = await RequestModel.findById(req.params.id)
            return res.json(request)
        } catch (error) {
            next(error)
        }
    }
}