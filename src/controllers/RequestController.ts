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

interface ShowInterface
{
    id: string
    data: Date
    condicao: string
    digitado_por?: string
    peso?: number
    tipo: {venda: boolean, troca: boolean}
    status: {concluido: boolean, enviado: boolean, faturado: boolean}
    cliente: {id: string, nome: string}
    vendedor: {id: string, nome: string}
    representada: {id: string, nome: string}
    linha: {id: string, nome: string}
    produtos: Array<
    {
        id: string,
        nome: string,
        imagem: string,
        quantidade: number, 
        preco: number, 
        precoTabela: number,
        ipi: number,
        st: number,
        subtotal: number
    }>
    valorTotalProdutos: number
    valorTotal: number
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
            if (request !== null)
            {
                const client = await Client.findById(request.cliente)
                const seller = await Seller.findById(request.vendedor)
                const company = await Company.findById(request.representada)
                const line = company?.linhas.find(linha => linha._id === request.linha)
                if (line !== undefined)
                {
                    let totalValue = 0
                    let totalProductsValue = 0

                    const products = line.produtos.map(product =>
                    {
                        const tmp = request.produtos.map(productSold =>
                        {
                            if (product._id === productSold.id)
                            {
                                const table = client?.representadas
                                    .find(tmpCompany => tmpCompany.id === company?._id)?.tabela
                                const tablePrice = line.produtos
                                    .find(tmpProduct => tmpProduct._id === product._id)?.tabelas
                                    .find(tmpTable => tmpTable.nome === table)?.preco
                                const subtotal = productSold.quantidade*productSold.preco
                                    +productSold.quantidade*productSold.preco*product.ipi/100
                                    +productSold.quantidade*productSold.preco*product.st/100

                                totalProductsValue += productSold.quantidade*productSold.preco
                                totalValue += subtotal

                                return {
                                    id: product._id,
                                    nome: product.nome,
                                    imagem: String(product.imagem),
                                    quantidade: productSold.quantidade, 
                                    preco: productSold.preco, 
                                    precoTabela: Number(tablePrice),
                                    ipi: product.ipi,
                                    st: product.st,
                                    subtotal: subtotal
                                }
                            }
                            else return {
                                id: '',
                                nome: '',
                                imagem: '',
                                quantidade: 0, 
                                preco: 0, 
                                precoTabela: 0,
                                ipi: 0,
                                st: 0,
                                subtotal: 0
                            }
                        })
                        Promise.all(tmp)
                        return tmp
                    })[0]
                    await Promise.all(products)
                    console.log(products)

                    if (products !== undefined)
                    {
                        const show: ShowInterface =
                        {
                            id: request._id,
                            data: request.data,
                            condicao: request.condicao,
                            digitado_por: request.digitado_por,
                            peso: request.peso,
                            tipo: request.tipo,
                            status: request.status,
                            cliente: {id: request.cliente, nome: client !== null ? client.nome_fantasia : ''},
                            vendedor: {id: request.vendedor, nome: seller !== null ? seller.nome : ''},
                            representada: {id: request.representada, nome: company !== null ? company.nome_fantasia : ''},
                            linha: {id: request.linha, nome: line !== undefined ? line.nome : ''},
                            produtos: products,
                            valorTotalProdutos: totalProductsValue,
                            valorTotal: totalValue
                        }
                       return res.json(show)
                    }
                }
            }
        } catch (error) {
            next(error)
        }
    }
}