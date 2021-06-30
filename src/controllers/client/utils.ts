import {Request, Response} from 'express'

import Client from '../../models/Client'
import Company from '../../models/Company'
import {getDate} from '../../utils/getDate'

const clientUtils = {
	getConditions: async (req: Request, res: Response) => {
		const {client: clientId, company: companyId} = req.params

		const client = await Client.findById(clientId)
		if (!client)
			return res.status(404).json({message: 'Cliente não encontrado!'})

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const conditions = company.condicoes

		return res.json(conditions)
	},

	addContact: async (req: Request, res: Response) => {
		const {client: clientId} = req.params
		const {nome, telefone}: {nome: string; telefone: string} = req.body

		const client = await Client.findById(clientId)
		if (!client)
			return res.status(404).json({message: 'Cliente não encontrado!'})

		const contacts: Array<{
			nome: string
			telefone: string
		}> = client.contatos ? client.contatos : []

		contacts.push({nome, telefone})

		await Client.findByIdAndUpdate(client._id, {
			contatos: contacts,
			modificadoEm: getDate()
		})
		return res.send()
	},

	getContacts: async (req: Request, res: Response) => {
		const {client: clientId} = req.params

		const client = await Client.findById(clientId)
		if (!client)
			return res.status(404).json({message: 'Cliente não encontrado!'})

		const contacts = client.contatos ? client.contatos : []
		return res.json(contacts)
	}
}

export default clientUtils
