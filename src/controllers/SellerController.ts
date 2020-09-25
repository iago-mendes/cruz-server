import { Request, Response, NextFunction } from 'express'

import Seller from '../models/Seller'

export default class SellerControler
{
    async create(req: Request, res: Response, next: NextFunction)
    {
        try {
            const seller = req.body
            await Seller.create(seller)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction)
    {
        try {
            const seller = req.body
            const tmp = await Seller.findByIdAndUpdate(req.params.id, seller, {new: true})
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async remove(req: Request, res: Response, next: NextFunction)
    {
        try {
            const tmp = await Seller.findByIdAndDelete(req.params.id)
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async list(req: Request, res: Response, next: NextFunction)
    {
        try {
            const sellers = await Seller.find()
            return res.json(sellers)
        } catch (error) {
            next(error)
        }
    }

    async show(req: Request, res: Response, next: NextFunction)
    {
        try {
            const seller = await Seller.findById(req.params.id)
            return res.json(seller)
        } catch (error) {
            next(error)
        }
    }

    async all(req: Request, res: Response, next: NextFunction)
    {
        try {
            const sellers = await Seller.find()
            return res.json(sellers)
        } catch (error) {
            next(error)
        }
    }
}