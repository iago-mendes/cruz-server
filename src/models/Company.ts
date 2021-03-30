import mongoose from 'mongoose'

export interface Product
{
	_id?: string
	imagem?: string
	codigo: number
	nome: string
	ipi: number
	st: number
	unidade: string
	comissao: number
	peso?: number
	volume?: number
	tabelas: Array<{id: string, preco: number}>
}

export type CompanyType = mongoose.Document &
{
	_id: string
	imagem?: string
	razao_social: string
	nome_fantasia: string
	cnpj: string
	telefones: Array<string>
	email: string
	descricao_curta?: string
	descricao?: string
	site?: string
	comissao: {porcentagem: number, obs: Array<string>}
	tabelas: Array<{_id?: string, nome: string}>
	condicoes: Array<{_id?: string, nome: string, precoMin: number}>
	contatos: Array<{_id?: string, nome: string, telefone: string}>
	produtos: Product[]
}

const CompanySchema = new mongoose.Schema(
{
	imagem: {type: String, required: false},
	razao_social: {type: String, required: true},
	nome_fantasia: {type: String, required: true},
	cnpj: {type: String, required: true},
	telefones: [{type: Number, required: true}],
	email: {type: String, required: true},
	descricao_curta: {type: String, required: false},
	descricao: {type: String, required: false},
	site: {type: String, required: false},
	comissao:
	{
		porcentagem: {type: Number, required: true},
		obs: [{type: String, required: false}]
	},
	tabelas:
	[{
		nome: {type: String, required: true}
	}],
	condicoes:
	[{
		nome: {type: String, required: true},
		precoMin: {type: Number, required: true}
	}],
	contatos:
	[{
		nome: {type: String, required: true},
		telefone: {type: String, required: true}
	}],
	produtos:
	[{
		imagem: {type: String, required: false},
		codigo: {type: Number, required: true},
		nome: {type: String, required: true},
		ipi: {type: Number, required: true},
		st: {type: Number, required: true},
		unidade: {type: String, required: true},
		comissao: {type: Number, required: true},
		peso: {type: Number, required: false},
		volume: {type: Number, required: false},
		tabelas:
		[{
			id: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada.tabelas', required: true},
			preco: {type: Number, required: true}
		}]
	}]
})

export default mongoose.model<CompanyType>('Representada', CompanySchema)