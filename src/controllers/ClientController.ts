import { Request, Response, NextFunction } from 'express'

import Client from '../models/Client'

export default class ClientController
{
    async create(req: Request, res: Response, next: NextFunction)
    {
        try {
            const client = req.body
            await Client.create(client)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction)
    {
        try {
            const client = req.body
            const tmp = await Client.findByIdAndUpdate(req.params.id, client, {new: true})
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async remove(req: Request, res: Response, next: NextFunction)
    {
        try {
            const tmp = await Client.findByIdAndDelete(req.params.id)
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async list(req: Request, res: Response, next: NextFunction)
    {
        try {
            const clients = await Client.find()
            return res.json(clients)
        } catch (error) {
            next(error)
        }
    }

    async show(req: Request, res: Response, next: NextFunction)
    {
        try {
            const client = await Client.findById(req.params.id)
            return res.json(client)
        } catch (error) {
            next(error)
        }
    }

    async all(req: Request, res: Response, next: NextFunction)
    {
        try {
            const clients = await Client.find()
            return res.json(clients)
        } catch (error) {
            next(error)
        }
    }
}