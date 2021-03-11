import mongoose from 'mongoose'

export type RequestType = mongoose.Document &
{
	cliente: string
	vendedor?: string
	representada: string
	produtos: Array<{id: string, quantidade: number, preco: number, linhaId: string}>
	data: string
	condicao: string
	digitado_por?: string
	peso?: number
	volume?: number
	tipo: {venda: boolean, troca: boolean}
	status: {concluido: boolean, enviado: boolean, faturado: boolean}
}

const RequestSchema = new mongoose.Schema(
{
	data: {type: String, required: true},
	condicao: {type: String, required: true},
	digitado_por: {type: String, required: false},
	cliente: {type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true},
	vendedor: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: false},
	representada: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada', required: true},
	peso: {type: Number, required: false},
	volume: {type: Number, required: false},
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
		id: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada.produtos', required: true},
		quantidade: {type: Number, required: true},
		preco: {type: Number, required: true}
	}]
})

export default mongoose.model<RequestType>('Pedido', RequestSchema)