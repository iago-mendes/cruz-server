import {RequestType} from '../../models/Request'
import {CompanyType} from '../../models/Company'

function getTotalValue(request: RequestType, company?: CompanyType | null) {
	let totalValue = 0

	request.produtos.map(productSold => {
		const subtotalWithoutTaxes = productSold.quantidade * productSold.preco

		if (!company) return (totalValue += subtotalWithoutTaxes)

		const product = company.produtos.find(
			product => String(product._id) == String(productSold.id)
		)
		if (!product) return (totalValue += subtotalWithoutTaxes)

		const subtotal =
			subtotalWithoutTaxes +
			(subtotalWithoutTaxes * product.ipi) / 100 +
			(subtotalWithoutTaxes * product.st) / 100

		totalValue += subtotal
	})

	return totalValue
}

export default getTotalValue
