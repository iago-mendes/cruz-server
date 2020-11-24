import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'

import Seller from '../models/Seller'
import Company from '../models/Company'
import baseUrl from '../config/baseUrl'

interface List
{
    id: string
    imagem: string
    nome: string
    funcao: string | undefined
}

export default class SellerControler
{
    async create(req: Request, res: Response, next: NextFunction)
    {
        try {
						const image = req.file
						const {nome, telefones, email, senha, funcao, admin, representadas} = req.body
						
            await Seller.create(
						{
							nome,
							imagem: image && image.filename,
							telefones: JSON.parse(telefones),
							email,
							senha,
							funcao,
							admin,
							representadas: JSON.parse(representadas)
						})
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction)
    {
        try {
					const {id} = req.params
					const image = req.file
					const {nome, telefones, email, senha, funcao, admin, representadas} = req.body

					interface Update
					{
							[letter: string]: any
					}
					let seller: Update = {}

					seller['_id'] = id
					if (nome) seller['nome'] = nome
					if (image)
					{
						seller['image'] = image.filename
						const previous = await Seller.findById(id)
						if (previous?.imagem)
							fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', previous.imagem))
					}
					if (telefones) seller['telefones'] = JSON.parse(telefones)
					if (email) seller['email'] = email
					if (senha) seller['senha'] = senha
					if (funcao) seller['funcao'] = funcao
					if (admin) seller['admin'] = admin
					if (representadas) seller['representadas'] = JSON.parse(representadas)

					const newSeller = await Seller.findByIdAndUpdate(id, seller, {new: true})
					res.status(200).send()
					return newSeller
        } catch (error) {
            next(error)
        }
    }

    async remove(req: Request, res: Response, next: NextFunction)
    {
        try {
					const {id} = req.params

					const company = await Company.findById(id)
					if (company?.imagem)
						fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', company.imagem))

					const tmp = await Seller.findByIdAndDelete(id)
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
                    imagem: seller.imagem
											? `${baseUrl}/uploads/${seller.imagem}`
											: `${baseUrl}/uploads/assets/no-image.png`,
                    nome: seller.nome,
                    funcao: seller.funcao
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
                    imagem: seller.imagem
											? `${baseUrl}/uploads/${seller.imagem}`
											: `${baseUrl}/uploads/assets/no-image.png`,
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