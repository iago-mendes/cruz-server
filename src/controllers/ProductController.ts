import { Request, Response, NextFunction } from 'express'

import Company from '../models/Company'
import baseUrl from '../config/baseUrl'

export default class ProductController
{
    async listLines(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = await Company.findById(req.params.id)
            if (!company) return res.json({message: 'company not found'})

            const list = company.linhas.map(linha => (
            {
                id: linha._id,
                nome: linha.nome,
                imagem: linha.imagem
                    ? `${baseUrl}/uploads/${linha.imagem}`
                    : `${baseUrl}/uploads/assets/no-image.png`
            }))
            await Promise.all(list)

            return res.json(list)
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
                id: produto._id,
                imagem: produto.imagem
                    ? `${baseUrl}/uploads/${produto.imagem}`
                    : `${baseUrl}/uploads/assets/no-image.png`,
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