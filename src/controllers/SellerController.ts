import { Request, Response, NextFunction } from 'express'

import Seller from '../models/Seller'
import Company from '../models/Company'

interface List
{
    id: string
    imagem: string
    nome: string
    funcao: string
}

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
            let list: List[] = []
            const sellers = await Seller.find()

            const promises = sellers.map(seller =>
            {
                list.push(
                {
                    id: seller._id,
                    imagem: String(seller.imagem),
                    nome: seller.nome,
                    funcao: String(seller.funcao)
                })
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
            const seller = await Seller.findById(req.params.id)
            if(seller !== null)
            {
                let companies: {id: string, nome_fantasia: string}[] = []
                const promises = seller.representadas.map(async company =>
                {
                    const tmpCompany = await Company.findById(company.id)
                    companies.push(
                    {
                        id: company.id,
                        nome_fantasia: String(tmpCompany?.nome_fantasia)
                    })
                })
                await Promise.all(promises)

                return res.json(
                {
                    id: seller._id,
                    imagem: seller.imagem,
                    nome: seller.nome,
                    funcao: seller.funcao,
                    telefones: seller.telefones,
                    representadas: companies
                })
            }
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