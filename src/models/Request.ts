import mongoose from 'mongoose'

type RequestType = mongoose.Document &
{
	data: Date
	condicao: string
	digitado_por?: string
	cliente: string
	vendedor: string
	representada: string
	linha: string
	peso?: number
	tipo: {venda: boolean, troca: boolean}
	status: {concluido: boolean, enviado: boolean, faturado: boolean}
	produtos: Array<{id: string, quantidade: number, preco: number}>
}

const RequestSchema = new mongoose.Schema(
{
	data: {type: Date, default: Date.now(), required: true},
	condicao: {type: String, required: true},
	digitado_por: {type: String, required: false},
	cliente: {type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true},
	vendedor: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: true},
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

export default mongoose.model<RequestType>('Pedido', RequestSchema)