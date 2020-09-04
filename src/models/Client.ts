import mongoose from 'mongoose'

const ClientSchema = new mongoose.Schema(
{
    imagem: {type: String, required: false},
    razao_social: {type: String, required: true},
    nome_fantasia: {type: String, required: true},
    cnpj: {type: Number, required: true},
    insc_estadual: {type: Number, required: true},
    telefone: {type: Number, required: true},
    email: {type: String, required: true},
    vendedores: [{type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor'}],
    endereco:
    {
        rua: {type: String, required: false},
        numero: {type: Number, required: false},
        bairro: {type: String, required: false},
        cep: {type: Number, required: false},
        cidade: {type: String, required: false},
        uf: {type: String, required: false}
    },
    status:
    {
        ativo: {type: Boolean, required: true},
        aberto: {type: Boolean, required: true},
        nome_sujo: {type: Boolean, required: true}
    },
    representadas:
    [{
        id: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada'},
        tabela: {type: mongoose.Schema.Types.ObjectId}
    }]
})

mongoose.model('Cliente', ClientSchema)