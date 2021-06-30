import Request from '../../models/Request'
import Company from '../../models/Company'
import Client from '../../models/Client'
import Seller from '../../models/Seller'
import formatImage from '../formatImage'
import getPricedProducts from './getPricedProducts'
import {Product} from './getPricedProducts'

export interface RequestFormated {
	id: string
	data: string
	condicao: string
	digitado_por?: string
	peso: number
	volume: number
	contato: {
		nome: string
		telefone: string
	}
	frete: string
	tipo: {
		venda: boolean
		troca: boolean
	}
	status: {
		concluido: boolean
		enviado: boolean
		faturado: boolean
	}
	cliente: {
		id: string
		nome_fantasia: string
		razao_social: string
		imagem: string
		endereco: {
			rua?: string
			numero?: string
			complemento?: string
			bairro?: string
			cep?: string
			cidade?: string
			uf?: string
		}
		cnpj: string
		insc_estadual: string
		telefone?: string
		email: string
	}
	vendedor: {
		id: string
		nome: string
		imagem: string
	}
	representada: {
		id: string
		razao_social: string
		nome_fantasia: string
		imagem: string
	}
	produtos: Product[]
	descontoTotal: number
	valorTotalProdutos: number
	valorTotal: number
	quantidadeTotal: number
}

const getRequest = async (id: string) => {
	const rawRequest = await Request.findById(id)
	if (!rawRequest) return {error: 'Pedido não encontrado!'}

	const client = await Client.findById(rawRequest.cliente)
	if (!client) return {error: 'Cliente não encontrado!'}

	const seller = await Seller.findById(rawRequest.vendedor)

	const company = await Company.findById(rawRequest.representada)
	if (!company) return {error: 'Representada não encontrada!'}

	const {
		products,
		totalValue,
		totalProductsValue,
		totalDiscount,
		totalQuantity,
		weight,
		volume
	} = getPricedProducts(rawRequest, company, client)

	const request: RequestFormated = {
		id: rawRequest._id,
		data: rawRequest.data,
		condicao: rawRequest.condicao,
		digitado_por: rawRequest.digitado_por,
		peso: weight,
		volume: volume,
		contato: rawRequest.contato?.nome
			? rawRequest.contato
			: {nome: '', telefone: ''},
		frete: rawRequest.frete ? rawRequest.frete : '',
		tipo: rawRequest.tipo,
		status: rawRequest.status,
		cliente: {
			id: rawRequest.cliente,
			nome_fantasia: client.nome_fantasia,
			razao_social: client.razao_social,
			imagem: formatImage(client.imagem),
			endereco: client.endereco,
			cnpj: client.cnpj,
			insc_estadual: client.insc_estadual,
			telefone: client.telefone,
			email: client.email
		},
		vendedor: {
			id: seller ? String(rawRequest.vendedor) : 'ecommerceId',
			nome: seller ? seller.nome : 'E-Commerce',
			imagem: formatImage(seller ? seller.imagem : undefined)
		},
		representada: {
			id: rawRequest.representada,
			razao_social: company.razao_social,
			nome_fantasia: company.nome_fantasia,
			imagem: formatImage(company.imagem)
		},
		produtos: products,
		descontoTotal: totalDiscount,
		valorTotalProdutos: totalProductsValue,
		valorTotal: totalValue,
		quantidadeTotal: totalQuantity
	}
	return {request}
}

export default getRequest
