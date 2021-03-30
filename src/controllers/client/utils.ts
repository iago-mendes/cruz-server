import {Request, Response} from 'express'

import Client from '../../models/Client'
import Company from '../../models/Company'

const clientUtils =
{
	getConditions: async (req: Request, res: Response) =>
	{
		const {client: clientId, company: companyId} = req.params
		
		const client = await Client.findById(clientId)
		if (!client)
			return res.status(404).json({message: 'Cliente não encontrado!'})

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const conditions =
		{
			vista: client.condicoes.vista,
			cheque: client.condicoes.cheque,
			prazo: client.condicoes.prazo,
			prazoOpcoes: company.condicoes
		}

		return res.json(conditions)
	},

	addContact: async (req: Request, res: Response) =>
	{
		const {client: clientId} = req.params
		const {nome, telefone}:{nome: string, telefone: string} = req.body

		const client = await Client.findById(clientId)
		if (!client)
			return res.status(404).json({message: 'Cliente não encontrado!'})
		
		let contacts: Array<
		{
			nome: string
			telefone: string
		}> = client.contatos ? client.contatos : []

		contacts.push({nome, telefone})

		await Client.findByIdAndUpdate(client._id, {contatos: contacts})
		return res.send()
	}
}

export default clientUtils