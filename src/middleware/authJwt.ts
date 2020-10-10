import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import Seller from '../models/Seller'
import { secret } from '../config/auth'

export default
{
    verigyToken: (req: Request, res: Response, next: NextFunction) =>
    {
        let token = req.headers["x-access-token"]
      
        if (token)
        {      
            jwt.verify(String(token), secret, (err, decoded) =>
            {
                if (err) return res.status(401).send({ message: "Unauthorized!" })
                // req.userId = decoded.id
                next()
            })
        }
        else return res.status(403).send({ message: "No token provided!" })
    },

    isSeller: (req: Request, res: Response, next: NextFunction) =>
    {
        const {id} = req.query

        Seller.findById(id).exec((err, seller) =>
        {
          if (err) return res.status(500).send({ message: err })
          if (seller) return next()
          return res.status(403).send({ message: "Requires seller role!" })
        })
    },
    
    isAdmin: (req: Request, res: Response, next: NextFunction) =>
    {
        const {id} = req.query

        Seller.findById(id).exec((err, seller) =>
        {
          if (err || seller === null) return res.status(500).send({ message: err })
          if (seller.admin) return next()
          return res.status(403).send({ message: "Requires admin role!" })
        })
    }
}