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

    async showPricedProduct(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = await Company.findById(req.params.id)
            if (!company) return res.json({message: 'company not found'})
            const line = company?.linhas.find(linha => linha._id == req.params.line)
            if (!line) return res.json({message: 'line not found'})
            const product = line.produtos.find(produto => produto._id == req.params.product)
            if (!product) return res.json({message: 'product not found'})

            const {client: clientId} = req.query
            const client = await Client.findById(clientId)
            if (!client) return res.json({message: 'client not found'})

            const table = client.representadas.find(representada => representada.id == String(company?._id))?.tabela
            if (!table) return res.json({message: 'table not found'})

            const show =
            {
                id: product._id,
                imagem: product.imagem
                    ? `${baseUrl}/uploads/${product.imagem}`
                    : `${baseUrl}/uploads/assets/no-image.png`,
                nome: product.nome,
                unidade: product.unidade,
                ipi: product.ipi,
                st: product.st,
                preco: product.tabelas.find(tabela => tabela.nome == table)?.preco
            }

            return res.json(show)
        } catch (error) {
            next(error)
        }
    }

    async showProduct(req: Request, res: Response, next: NextFunction)
    {
        try {
            const company = await Company.findById(req.params.id)
            if (!company) return res.json({message: 'company not found'})
            const line = company?.linhas.find(linha => linha._id == req.params.line)
            if (!line) return res.json({message: 'line not found'})
            const product = line.produtos.find(produto => produto._id == req.params.product)
            if (!product) return res.json({message: 'product not found'})

            const {client: clientId} = req.query
            const client = await Client.findById(clientId)
            if (!client) return res.json({message: 'client not found'})

            const show =
            {
                id: product._id,
                imagem: product.imagem
                    ? `${baseUrl}/uploads/${product.imagem}`
                    : `${baseUrl}/uploads/assets/no-image.png`,
                nome: product.nome,
                codigo: product.codigo,
                unidade: product.unidade,
                ipi: product.ipi,
                st: product.st,
                tabelas: product.tabelas
            }

            return res.json(show)
        } catch (error) {
            next(error)
        }
    }

    async updateProduct(req: Request, res: Response, next: NextFunction)
    {
        try {
            const {nome, unidade, ipi, st, tabelas, codigo, comissao} = req.body
            let image = req.file

            let previousCompany = await Company.findById(req.params.id)
            if (!previousCompany) return res.json({message: 'company not found'})
            const previousLine = previousCompany.linhas.find(linha => linha._id == req.params.line)
            if (!previousLine) return res.json({message: 'line not found'})
            const previous = previousLine.produtos.find(produto => produto._id == req.params.product)
            if (!previous) return res.json({message: 'product not found'})

            if (image)
            {
                if (image.originalname === previous.imagem)
                {
                    fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', image.filename))
                    image.filename = previous.imagem
                }
                else if (previous.imagem) fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', previous.imagem))
            }
            else if (previous.imagem) fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', previous.imagem))

            const lines = previousCompany.linhas.map(linha =>
            {
                if (linha._id != req.params.line) return linha
                else return {
                    _id: linha._id,
                    nome: linha.nome,
                    imagem: linha.imagem,
                    produtos: linha.produtos.map(produto =>
                    {
                        if (produto._id != req.params.product) return produto
                        else return {
                            _id: produto._id,
                            imagem: image ? image.filename : undefined,
                            codigo,
                            nome,
                            ipi,
                            st,
                            unidade,
                            comissao,
                            tabelas: JSON.parse(tabelas)
                        }
                    })
                }
            })

            const tmp = await Company.findByIdAndUpdate(req.params.id, {linhas: lines})
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }
}