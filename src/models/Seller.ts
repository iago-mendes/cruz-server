import mongoose from 'mongoose'

type SellerType = mongoose.Document &
{
    nome: string
    imagem?: string
    email: string
    senha: string
    funcao?: string
    admin: boolean
    telefones: Array<{numero: number, whatsapp: boolean}>
    representadas: Array<{id: string, comissao: number}>
}

const SellerSchema = new mongoose.Schema(
{
    nome: {type: String, required: true},
    imagem: {type: String, required: false},
    email: {type: String, required: true},
    senha: {type: String, required: true},
    funcao: {type: String, required: false},
    admin: {type: Boolean, required: true},
    telefones:
    [{
        numero: {type: Number, required: true},
        whatsapp: {type: Boolean, required: true}
    }],
    representadas:
    [{
        id: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada', required: true},
        comissao: {type: Number, required: true}
    }]
})

export default mongoose.model<SellerType>('Vendedor', SellerSchema)