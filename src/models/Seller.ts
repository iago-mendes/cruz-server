import mongoose from 'mongoose'

export type SellerType = mongoose.Document & {
	nome: string
	imagem?: string
	email: string
	senha: string
	funcao?: string
	admin: boolean
	telefones: Array<{numero: number; whatsapp: boolean}>
	representadas: Array<{id: string; comissao: number}>
	modificadoEm?: string
}

const SellerSchema = new mongoose.Schema({
	nome: {type: String, required: true},
	imagem: {type: String, required: false},
	email: {type: String, required: true},
	senha: {type: String, required: true},
	funcao: {type: String, required: false},
	admin: {type: Boolean, required: true},
	telefones: [
		{
			numero: {type: Number, required: true},
			whatsapp: {type: Boolean, required: true}
		}
	],
	representadas: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Representada',
				required: true
			},
			comissao: {type: Number, required: true}
		}
	],
	modificadoEm: {type: String}
})

export default mongoose.model<SellerType>('Vendedor', SellerSchema)
