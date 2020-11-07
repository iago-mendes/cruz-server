import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import Seller from '../models/Seller'

export default
{
    verifyToken: (req: Request, res: Response, next: NextFunction) =>
    {
        let token = req.headers['token']
      
        if (token)
        {      
            jwt.verify(String(token), String(process.env.AUTH_SECRET), (err, decoded) =>
            {
                if (err) return res.status(401).send({ message: "Unauthorized!" })
                next()
            })
        }
        else return res.status(403).send({ message: "No token provided!" })
    },

    isSeller: (req: Request, res: Response, next: NextFunction) =>
    {
        const id = req.headers['id']

        Seller.findById(id).exec((err, seller) =>
        {
          if (err) return res.status(500).send({ message: err })
          if (seller) return next()
          return res.status(403).send({ message: "Requires seller role!" })
        })
    },
    
    isAdmin: (req: Request, res: Response, next: NextFunction) =>
    {
        const id = req.headers['id']

        Seller.findById(id).exec((err, seller) =>
        {
          if (err || seller === null) return res.status(500).send({ message: err })
          if (seller.admin) return next()
          return res.status(403).send({ message: "Requires admin role!" })
        })
    }
}