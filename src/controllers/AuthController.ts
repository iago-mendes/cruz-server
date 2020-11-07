import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import Client from '../models/Client'
import Seller from '../models/Seller'

export default
{
    logIn: async (req: Request, res: Response) =>
    {
        let user = {email: '', password: '', id: '', role: ''}

        const client = await Client.findOne({email: req.body.email})
        if (client) user = {email: client.email, password: client.senha, id: client._id, role: 'client'}
        else
        {
            const seller = await Seller.findOne({email: req.body.email})
            if (seller) user =
            {
                email: seller.email, password: seller.senha, id: seller._id, role: seller.admin ? 'admin' : 'seller'
            }
            else return res.status(404).send({ message: "Usuário não encontrado." })
        }

        const isPasswordValid = String(req.body.password) === user.password
        if (!isPasswordValid) return res.status(401).send(
        {
            token: null,
            message: "Senha inválida!"
        })

        const token = jwt.sign({id: user.email}, String(process.env.AUTH_SECRET))
        return res.status(200).send({token, id: user.id, role: user.role})
    }
}