import {Request, Response} from 'express'
import path from 'path'

import Client from '../../models/Client'
import Company from '../../models/Company'
import encryptPwd from '../../utils/encryptPwd'
import { getDate } from '../../utils/getDate'
import getRandomNumber from '../../utils/getRandomNumber'

const clientHeader: Array<
{
	name: string
	field: string
}> = require(path.resolve('db', 'sheets', 'clientHeader.json'))

function getFieldName(field: string)
{
	const column = clientHeader.find(column => column.field === field)
	if (!column)
		return ''
	
	return column.name
}

const clientSheet =
{
	getHeader: async (req: Request, res: Response) =>
	{
		const header = clientHeader.map(({name}) => name)

		return res.json(header)
	},

	setClients: async (req: Request, res: Response) =>
	{
		const {header, data: sheetClients}:
		{
			header: string[]
			data: Array<
			{
				[fieldName: string]: string | number
			}>
		} = req.body

		if (header.length !== clientHeader.length)
			return res.status(400).json({message: 'Planilha inválida! Número de colunas incorreto!'})
		
		let isValid = true
		clientHeader.map(({name}, index) =>
		{
			if (header[index] !== name)
				isValid = false
		})
		if (!isValid)
			return res.status(400).json({message: 'Planilha inválida! Descrição de colunas incorreta!'})
		
		const companies = await Company.find()

		Promise.all(sheetClients.map(async sheetClient =>
		{
			const email = String(sheetClient[getFieldName('email')])
				.trim().split(' ')[0]
			const existingClient = await Client.findOne({email})
			
			if (existingClient)
			{
				const client =
				{
					razao_social: String(sheetClient[getFieldName('razao_social')]),
					nome_fantasia: String(sheetClient[getFieldName('nome_fantasia')]),
					cnpj: String(sheetClient[getFieldName('cnpj')]),
					insc_estadual: String(sheetClient[getFieldName('insc_estadual')]),
					email: email,
					endereco:
					{
						rua: String(sheetClient[getFieldName('rua')]),
						bairro: String(sheetClient[getFieldName('bairro')]),
						cidade: String(sheetClient[getFieldName('cidade')]),
						uf: String(sheetClient[getFieldName('uf')]),
						cep: String(sheetClient[getFieldName('cep')])
					},
					modificadoEm: getDate()
				}

				await Client.findByIdAndUpdate(existingClient._id, client)
			}
			else
			{
				const client =
				{
					razao_social: String(sheetClient[getFieldName('razao_social')]),
					nome_fantasia: String(sheetClient[getFieldName('nome_fantasia')]),
					cnpj: String(sheetClient[getFieldName('cnpj')]),
					insc_estadual: String(sheetClient[getFieldName('insc_estadual')]),
					email: email,
					senha: encryptPwd(String(getRandomNumber(4))),
					vendedores: [],
					endereco:
					{
						rua: String(sheetClient[getFieldName('rua')]),
						bairro: String(sheetClient[getFieldName('bairro')]),
						cidade: String(sheetClient[getFieldName('cidade')]),
						uf: String(sheetClient[getFieldName('uf')]),
						cep: String(sheetClient[getFieldName('cep')])
					},
					status: {ativo: true, aberto: true, nome_sujo: false},
					condicoes: {prazo: true, cheque: true, vista: true},
					contatos: [],
					representadas: companies.filter(company => company.tabelas.length !== 0).map(company => (
						{
							id: String(company._id),
							tabela: String(company.tabelas[0]._id)
						}))
				}

				await Client.create(client)
			}
		}))

		return res.status(201).send()
	}
}

export default clientSheet