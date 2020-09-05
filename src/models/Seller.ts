import mongoose from 'mongoose'

const SellerSchema = new mongoose.Schema(
{
    nome: {type: String, required: true},
    imagem: {type: String, required: false},
    email: {type: String, required: true},
    senha: {type: String, required: true},
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

mongoose.model('Vendedor', SellerSchema)