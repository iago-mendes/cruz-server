import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import Client from '../models/Client'
import Seller from '../models/Seller'
import { secret } from '../config/auth'

export default
{
    logIn: async (req: Request, res: Response) =>
    {
        let user = {email: '', password: ''}

        const client = await Client.findOne({email: req.body.email})
        if (client) user = {email: client.email, password: client.senha}
        else
        {
            const seller = await Seller.findOne({email: req.body.email})
            if (seller) user = {email: seller.email, password: seller.senha}
            else return res.status(404).send({ message: "Usuário não encontrado." })
        }

        const isPasswordValid = bcrypt.compareSync(req.body.password, user.password)
        if (!isPasswordValid) return res.status(401).send(
        {
            accessToken: null,
            message: "Senha inválida!"
        })

        const token = jwt.sign({id: user.email}, secret)
        return res.status(200).send({email: user.email, token})
    }
}