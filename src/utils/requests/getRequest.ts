import Request from '../../models/Request'
import Company from '../../models/Company'
import Client from '../../models/Client'
import Seller from '../../models/Seller'
import formatImage from '../formatImage'
import getPricedProducts from './getPricedProducts'

const getRequest = async (id: string) =>
{
	const rawRequest = await Request.findById(id)
	if (!rawRequest)
		return {error: 'Pedido não encontrado!'}

	const client = await Client.findById(rawRequest.cliente)
	if (!client)
		return {error: 'Cliente não encontrado!'}

	const seller = await Seller.findById(rawRequest.vendedor)
	if (!seller)
		return {error: 'Vendedor não encontrado!'}

	const company = await Company.findById(rawRequest.representada)
	if (!company)
		return {error: 'Representada não encontrada!'}

	const {products, totalValue, totalProductsValue, totalDiscount} = getPricedProducts(rawRequest, company, client)

	const request =
	{
		id: rawRequest._id,
		data: rawRequest.data,
		condicao: rawRequest.condicao,
		digitado_por: rawRequest.digitado_por,
		peso: rawRequest.peso,
		tipo: rawRequest.tipo,
		status: rawRequest.status,
		cliente:
		{
			id: rawRequest.cliente,
			nome_fantasia: client.nome_fantasia,
			razao_social: client.razao_social,
			imagem: formatImage(client.imagem),
			endereco: client.endereco
		},
		vendedor:
		{
			id: rawRequest.vendedor,
			nome: seller ? seller.nome : 'E-Commerce',
			imagem: formatImage(seller ? seller.imagem : undefined)
		},
		representada:
		{
			id: rawRequest.representada,
			razao_social: company.razao_social,
			nome_fantasia: company.nome_fantasia,
			imagem: formatImage(company.imagem)
		},
		produtos: products,
		descontoTotal: totalDiscount,
		valorTotalProdutos: totalProductsValue,
		valorTotal: totalValue
	}
	return request
}

export default getRequest