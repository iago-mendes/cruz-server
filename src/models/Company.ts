import mongoose from 'mongoose'

const CompanySchema = new mongoose.Schema(
{
    imagem: {type: String, required: false},
    razao_social: {type: String, required: true},
    nome_fantasia: {type: String, required: true},
    cnpj: {type: Number, required: true},
    telefones: [{type: Number, required: true}],
    email: {type: String, required: true},
    comissao:
    {
        porcentagem: {type: Number, required: true},
        obs: [{type: String, required: false}]
    },
    linhas:
    [{
        nome: {type: String, required: true},
        produtos:
        [{
            imagem: {type: String, required: false},
            codigo: {type: Number, required: true},
            nome: {type: String, required: true},
            ipi: {type: Number, required: true},
            st: {type: Number, required: true},
            unidade: {type: String, required: true},
            comissao: {type: Number, required: true},
            tabelas:
            [{
                nome: {type: String, required: true},
                preco: {type: Number, required: true}
            }]
        }]
    }]
})

mongoose.model('Representada', CompanySchema)