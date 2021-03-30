import {Request, Response} from 'express'

import Client from '../../models/Client'

const clientUtils =
{
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