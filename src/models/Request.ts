import mongoose from 'mongoose'

const RequestSchema = new mongoose.Schema(
{
    numero: {type: Number, required: true},
    data: {type: Date, default: Date.now(), required: true},
    condicao: {type: String, required: true},
    digitado_por: {type: String, required: false},
    cliente: {type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true},
    representada: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada', required: true},
    linha: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada.linhas', required: true},
    peso: {type: Number, required: false},
    tipo:
    {
        venda: {type: Boolean, required: true},
        troca: {type: Boolean, required: true}
    },
    status:
    {
        concluido: {type: Boolean, required: true},
        enviado: {type: Boolean, required: true},
        faturado: {type: Boolean, required: true}
    },
    produtos:
    [{
        id: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada.linhas.produtos', required: true},
        quantidade: {type: Number, required: true},
        preco: {type: Number, required: true}
    }]
})

mongoose.model('Pedido', RequestSchema)