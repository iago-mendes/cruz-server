import ObjectID from 'bson-objectid'
import mongoose from 'mongoose'

export interface Product {
	_id?: string | ObjectID
	imagem?: string
	codigo: string
	nome: string
	ipi: number
	st: number
	unidade: string
	comissao: number
	peso?: number
	volume?: number
	tabelas: Array<{id: string; preco: number}>
	isBlocked?: boolean
}

export type CompanyType = mongoose.Document & {
	_id: string
	imagem?: string
	razao_social: string
	nome_fantasia: string
	cnpj: string
	telefones: Array<string>
	email?: string
	descricao_curta?: string
	descricao?: string
	site?: string
	comissao: {porcentagem: number; obs: Array<string>}
	tabelas: Array<{_id?: string; nome: string}>
	condicoes: Array<{_id?: string; nome: string; precoMin: number}>
	produtos: Product[]
	modificadoEm?: string
}

const CompanySchema = new mongoose.Schema({
	imagem: {type: String},
	razao_social: {type: String, required: true},
	nome_fantasia: {type: String, required: true},
	cnpj: {type: String, required: true},
	telefones: [{type: String, required: true}],
	email: {type: String},
	descricao_curta: {type: String},
	descricao: {type: String},
	site: {type: String},
	comissao: {
		porcentagem: {type: Number, required: true},
		obs: [{type: String}]
	},
	tabelas: [
		{
			nome: {type: String, required: true}
		}
	],
	condicoes: [
		{
			nome: {type: String, required: true},
			precoMin: {type: Number, required: true}
		}
	],
	produtos: [
		{
			imagem: {type: String},
			codigo: {type: String, required: true},
			nome: {type: String, required: true},
			ipi: {type: Number, required: true},
			st: {type: Number, required: true},
			unidade: {type: String, required: true},
			comissao: {type: Number, required: true},
			peso: {type: Number},
			volume: {type: Number},
			tabelas: [
				{
					id: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Representada.tabelas',
						required: true
					},
					preco: {type: Number, required: true}
				}
			],
			isBlocked: {type: Boolean}
		}
	],
	modificadoEm: {type: String}
})

export default mongoose.model<CompanyType>('Representada', CompanySchema)
