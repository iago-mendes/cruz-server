import {Request, Response} from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import Client from '../models/Client'
import Seller from '../models/Seller'
import encryptPwd from '../utils/encryptPwd'

const auth = {
	logInClient: async (req: Request, res: Response) => {
		const {email, password} = req.body

		const client = await Client.findOne({email})
		if (!client)
			return res
				.status(404)
				.json({token: null, message: 'Usuário de cliente não encontrado.'})

		const isPasswordValid = await bcrypt.compare(password, client.senha)
		if (!isPasswordValid)
			return res.status(401).json({
				token: null,
				message: 'Senha inválida!'
			})

		const token = jwt.sign(
			{id: String(client._id), role: 'client'},
			String(process.env.AUTH_SECRET)
		)

		return res.status(200).json({token})
	},

	logInSeller: async (req: Request, res: Response) => {
		const {email, password} = req.body

		const seller = await Seller.findOne({email})
		if (!seller)
			return res
				.status(404)
				.json({token: null, message: 'Usuário de vendedor não encontrado.'})

		const role = seller.admin ? 'admin' : 'seller'

		const isPasswordValid = await bcrypt.compare(password, seller.senha)
		if (!isPasswordValid)
			return res.status(401).json({
				token: null,
				message: 'Senha inválida!'
			})

		const token = jwt.sign(
			{id: String(seller._id), role},
			String(process.env.AUTH_SECRET)
		)

		return res.status(200).json({token})
	},

	changePasswordClient: async (req: Request, res: Response) => {
		const {client: clientId} = req.params
		const {senha}: {senha: string} = req.body

		const client = await Client.findById(clientId)
		if (!client)
			return res.status(404).json({message: 'Cliente não encontrado!'})

		if (!senha || senha === '')
			return res.status(400).json({message: 'Senha fornecida é inválida!'})

		const password = encryptPwd(senha)
		if (!password)
			return res.status(500).json({
				message: 'Algo de errado aconteceu durante a encriptação da senha!'
			})

		await Client.findByIdAndUpdate(client._id, {senha: password})
		return res.send()
	},

	changePasswordSeller: async (req: Request, res: Response) => {
		const {seller: sellerId} = req.params
		const {senha}: {senha: string} = req.body

		const sellerExists = await Seller.findById(sellerId)
		if (!sellerExists)
			return res.status(404).json({message: 'Vendedor não encontrado!'})

		if (!senha || senha === '')
			return res.status(400).json({message: 'Senha fornecida é inválida!'})

		const password = bcrypt.hashSync(senha, 10)
		if (!password)
			return res.status(500).json({
				message: 'Algo de errado aconteceu durante a encriptação da senha!'
			})

		await Seller.findByIdAndUpdate(sellerId, {senha: password})
		return res.send()
	}
}

export default auth
