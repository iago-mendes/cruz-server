import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import Seller from '../models/Seller'

export default
{
    verifyToken: (req: Request, res: Response, next: NextFunction) =>
    {
        let token = req.headers['token']
        if (!token) return res.status(403).send({ message: "Nenhum token informado!" })

        jwt.verify(String(token), String(process.env.AUTH_SECRET), (err, decoded) =>
        {
            if (err) return res.status(401).send({ message: "Token nao autorizado!" })
            next()
        })
    },

    isSeller: (req: Request, res: Response, next: NextFunction) =>
    {
        const token = req.headers['token']
        if (!token) return res.status(403).send({ message: "Nenhum token informado!" })

        const payload = jwt.decode(String(token))
        if (!payload || typeof payload === 'string')
            return res.status(403).send({message: 'Token informado nao possui payload valido!'})
        const {id} = payload

        Seller.findById(id).exec((err, seller) =>
        {
            if (err) return res.status(500).send({ message: err })
            if (seller) return next()
            return res.status(403).send({ message: "Requer funcao de vendedor!" })
        })
    },
    
    isAdmin: (req: Request, res: Response, next: NextFunction) =>
    {
        const token = req.headers['token']
        if (!token) return res.status(403).send({ message: "Nenhum token informado!" })

        const payload = jwt.decode(String(token))
        if (!payload || typeof payload === 'string')
            return res.status(403).send({message: 'Token informado nao possui payload valido!'})
        const {id} = payload

        Seller.findById(id).exec((err, seller) =>
        {
          if (err || seller === null) return res.status(500).send({ message: err })
          if (seller.admin) return next()
          return res.status(403).send({ message: "Requer funcao de admin!" })
        })
    }
}