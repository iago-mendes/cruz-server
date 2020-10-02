import { Request, Response, NextFunction } from 'express'
import fs from 'fs'

import Company from '../models/Company'

interface ListInterface
{
    id: string
    imagem: string
    nome_fantasia: string
    descricao_curta: string
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
            const imagem = req.file.filename
            Company.create(
            {
                imagem,
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
                linhas,
                descricao_curta,
                descricao,
                site
            } = req.body
            const imagem = req.file.filename
            const company =
            {
                id,
                imagem,
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
            }

            const previous = await Company.findById(id)
            fs.unlink(`../../uploads/${previous?.imagem}`, err =>
            {
                if(err) console.log(err)
            })

            const tmp = Company.findByIdAndUpdate(id, company, {new: true})
            res.status(200).send()
            return tmp
        } catch (error) {
            next(error)
        }
    }

    async remove(req: Request, res: Response, next: NextFunction)
    {
        try {
            const tmp = Company.findByIdAndDelete(req.params.id)
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
                    imagem: String(company.imagem),
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
                imagem: company?.imagem,
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