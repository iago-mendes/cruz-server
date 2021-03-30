import {Request, Response} from 'express'
import Company from '../../models/Company'

const companyUtils =
{
	addContact: async (req: Request, res: Response) =>
	{
		const {company: companyId} = req.params
		const {nome, telefone}:{nome: string, telefone: string} = req.body

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})
		
		let contacts: Array<
		{
			nome: string
			telefone: string
		}> = company.contatos ? company.contatos : []

		contacts.push({nome, telefone})

		await Company.findByIdAndUpdate(company._id, {contatos: contacts})
		return res.send()
	}
}

export default companyUtils