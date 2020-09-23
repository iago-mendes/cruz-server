import { Request, Response, NextFunction } from 'express'

import RequestModel from '../models/Request'
import Company from '../models/Company'
import Client from '../models/Client'
import Seller from '../models/Seller'

interface ListInterface
{
    id: string
    data: Date
    cliente: string
    vendedor: string
    representada: string
    tipo: {venda: boolean, troca: boolean}
    status: {concluido: boolean, enviado: boolean, faturado: boolean}
}

const defaultList =
{
    id: '',
    data: new Date(),
    cliente: '',
    vendedor: '',
    representada: '',
    tipo: {venda: false, troca: false},
    status: {concluido: false, enviado: false, faturado: false}
}

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
            let list: ListInterface[] = []
            const requests = await RequestModel.find()

            const promises = requests.map(async request =>
            {
                const client = await Client.findById(request.cliente)
                const seller = await Seller.findById(request.vendedor)
                const company = await Company.findById(request.representada)
                const tmp =
                {
                    id: request._id,
                    data: request.data,
                    cliente: String(client?.nome_fantasia),
                    vendedor: String(seller?.nome),
                    representada: String(company?.nome_fantasia),
                    tipo: request.tipo,
                    status: request.status
                }
                list.push(tmp)
            })
            await Promise.all(promises)

            return res.json(list)
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