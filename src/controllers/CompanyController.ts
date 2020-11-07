import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../models/Company'
import baseUrl from '../config/baseUrl'

interface ListInterface
{
    id: string
    imagem: string
    nome_fantasia: string
    descricao_curta: string
}

interface Images
{
    imagem: Array<{filename: string}>,
    imagens_linhas: Array<{originalname: string, filename: string}>,
    imagens_produtos: Array<{originalname: string, filename: string}>
}

interface Line
{
    nome: string,
    imagem: string,
    produtos: Array<
    {
        imagem?: string
        codigo: number
        nome: string
        ipi: number
        st: number
        unidade: string
        comissao: number
        tabelas: Array<{nome: string, preco: number}>
    }>
}

export default class CompanyController
{
    async create(req: Request, res: Response, next: NextFunction)
    {
        try {
            const {
                razao_social, 
                nome_fantasia,
                cnpj,
                telefones,
                email,
                comissao,
                linhas,
                descricao_curta,
                descricao,
                site
            } = req.body

            const images = (req.files as unknown) as Images
            const lines = (JSON.parse(linhas) as Line[]).map(linha => (
                {
                    nome: linha.nome,
                    imagem: images.imagens_linhas && String(images.imagens_linhas
                        .find(image => image.originalname === String(linha.imagem))?.filename),
                    produtos: linha.produtos.map(produto => (
                    {
                        imagem: images.imagens_produtos && String(images.imagens_produtos
                            .find(image => image.originalname === String(produto.imagem))?.filename),
                        codigo: produto.codigo,
                        nome: produto.nome,
                        ipi: produto.ipi,
                        st: produto.st,
                        unidade: produto.unidade,
                        comissao: produto.comissao,
                        tabelas: produto.tabelas
                    }
                    ))
                }
            ))
            
            Company.create(
            {
                imagem: images.imagem && images.imagem[0].filename,
                razao_social,
                nome_fantasia,
                cnpj,
                telefones: JSON.parse(telefones),
                email,
                comissao: JSON.parse(comissao),
                linhas: lines,
                descricao_curta,
                descricao,
                site
            })
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction)
    {
        try {
            const id = req.params.id
            const {
                razao_social, 
                nome_fantasia,
                cnpj,
                telefones,
                email,
                comissao,
                descricao_curta,
                descricao,
                site
            } = req.body

            let image = req.file
            
            interface Update
            {
                [letter: string]: any
            }
            let company: Update = {}

            company['_id'] = id
            if(image)
            {
                company['imagem'] = image.filename
                const previous = await Company.findById(id)
                if (previous?.imagem)
                    fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', previous.imagem))
            }
            if(razao_social) company['razao_social'] = razao_social
            if(nome_fantasia) company['nome_fantasia'] = nome_fantasia
            if(cnpj) company['cnpj'] = cnpj
            if(telefones) company['telefones'] = JSON.parse(telefones)
            if(email) company['email'] = email
            if(comissao) company['comissao'] = JSON.parse(comissao)
            if(descricao_curta) company['descricao_curta'] = descricao_curta
            if(descricao) company['descricao'] = descricao
            if(site) company['site'] = site

            const tmp = Company.findByIdAndUpdate(id, company)
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async remove(req: Request, res: Response, next: NextFunction)
    {
        try {
            const {id} = req.params

            const company = await Company.findById(id)
            fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', String(company?.imagem)))

            const tmp = Company.findByIdAndDelete(id)
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
            const companies = await Company.find()

            const promises = companies.map(company =>
            {
                list.push(
                {
                    id: company._id,
                    imagem: `${baseUrl}/uploads/${String(company.imagem)}`,
                    nome_fantasia: company.nome_fantasia,
                    descricao_curta: String(company.descricao_curta)
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
            const company = await Company.findById(req.params.id)
            return res.json(
            {
                id: company?._id,
                imagem: `${baseUrl}/uploads/${String(company?.imagem)}`,
                nome_fantasia: company?.nome_fantasia,
                descricao: company?.descricao,
                site: company?.site
            })
        } catch (error) {
            next(error)
        }
    }

    async all(req: Request, res: Response, next: NextFunction)
    {
        try {
            const companies = await Company.find()
            return res.json(companies)
        } catch (error) {
            next(error)
        }
    }
}