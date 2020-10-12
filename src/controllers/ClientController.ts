import { Request, Response, NextFunction } from 'express'

import Client from '../models/Client'
import Company from '../models/Company'
import Seller from '../models/Seller'

interface List
{
    id: string
    imagem: string
    nome_fantasia: string
    razao_social: string
    status: {ativo: boolean, aberto: boolean, nome_sujo: boolean}
}

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
            const {cidade} = req.query

            let list: List[] = []
            const clients = await Client.find()
            
            const promises = clients.map(client =>
            {
                if (cidade !== undefined && cidade !== '')
                {
                    if (client.endereco.cidade === cidade)
                    {
                        list.push(
                        {
                            id: client.id,
                            imagem: String(client.imagem),
                            nome_fantasia: client.nome_fantasia,
                            razao_social: client.razao_social,
                            status: client.status
                        })
                    }
                }
                else
                {
                    list.push(
                    {
                        id: client.id,
                        imagem: String(client.imagem),
                        nome_fantasia: client.nome_fantasia,
                        razao_social: client.razao_social,
                        status: client.status
                    })
                }
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
            const client = await Client.findById(req.params.id)
            if (client !== null)
            {
                let sellers: {id: string, nome: string}[] = []
                const promises1 = client.vendedores.map(async seller =>
                {
                    const tmpSeller = await Seller.findById(seller)
                    sellers.push(
                    {
                        id: seller,
                        nome: String(tmpSeller?.nome)
                    })
                })
                await Promise.all(promises1)

                let companies: {id: string, nome_fantasia: string, tabela: string}[] = []
                const promises2 = client.representadas.map(async company =>
                {
                    const tmpCompany = await Company.findById(company.id)
                    companies.push(
                    {
                        id: company.id,
                        nome_fantasia: String(tmpCompany?.nome_fantasia),
                        tabela: company.tabela
                    })
                })
                await Promise.all(promises2)

                return res.json(
                {
                    id: client.id,
                    imagem: client.imagem,
                    razao_social: client.razao_social,
                    nome_fantasia: client.nome_fantasia,
                    cnpj: client.cnpj,
                    insc_estadual: client.insc_estadual,
                    telefone: client.telefone,
                    email: client.email,
                    endereco: client.endereco,
                    status: client.status,
                    vendedores: sellers,
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
            const clients = await Client.find()
            return res.json(clients)
        } catch (error) {
            next(error)
        }
    }
}