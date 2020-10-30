import { Request, Response, NextFunction } from 'express'

import Company from '../models/Company'
import baseUrl from '../config/baseUrl'

export default class ProductController
{
    async listLines(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = await Company.findById(req.params.id)
            return res.json(company?.linhas)
        } catch (error) {
            next(error)
        }
    }

    async listProducts(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = await Company.findById(req.params.id)
            const line = company?.linhas.find(linha => linha._id == req.params.line)
            if (!line) return res.json({message: 'line not found'})

            const list = line.produtos.map(produto => (
            {
                _id: produto._id,
                imagem: `${baseUrl}/uploads/${produto.imagem}`,
                nome: produto.nome,
                unidade: produto.unidade
            }))
            await Promise.all(list)

            return res.json(list)
        } catch (error) {
            next(error)
        }
    }
}