import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../models/Company'
import Client from '../models/Client'
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

    async updateLine(req: Request, res: Response, next: NextFunction)
    {
        try {
            const {nome} = req.body
            let image = req.file

            let company = await Company.findById(req.params.id)
            if (!company) return res.json({message: 'company not found'})
            const previous = company.linhas.find(linha => linha._id == req.params.line)
            if (!previous) return res.json({message: 'line not found'})

            if (image.originalname === previous.imagem)
            {
                fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', image.filename))
                image.filename = previous.imagem
            }
            else if (previous.imagem) fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', previous.imagem))

            const lines = company.linhas.map(linha =>
            {
                if (linha._id != req.params.line) return linha
                else return {
                    _id: linha._id,
                    nome,
                    imagem: image.filename,
                    produtos: linha.produtos
                }
            })

            const tmp = await Company.findByIdAndUpdate(req.params.id, {linhas: lines})
            res.status(200).send()
            return tmp
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

    async listPricedProducts(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = await Company.findById(req.params.id)
            const line = company?.linhas.find(linha => linha._id == req.params.line)
            if (!line) return res.json({message: 'line not found'})

            const {client: clientId} = req.query
            const client = await Client.findById(clientId)
            if (!client) return res.json({message: 'client not found'})

            console.log('[client.representadas]', client.representadas)
            console.log('[company.id]', company?._id)
            const table = client.representadas.find(representada => representada.id == String(company?._id))?.tabela
            if (!table) return res.json({message: 'table not found'})

            const list = line.produtos.map(produto => (
            {
                id: produto._id,
                imagem: produto.imagem
                    ? `${baseUrl}/uploads/${produto.imagem}`
                    : `${baseUrl}/uploads/assets/no-image.png`,
                nome: produto.nome,
                unidade: produto.unidade,
                preco: produto.tabelas.find(tabela => tabela.nome == table)?.preco
            }))
            await Promise.all(list)

            return res.json(list)
        } catch (error) {
            next(error)
        }
    }
}