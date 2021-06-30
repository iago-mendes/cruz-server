import PdfPrinter from 'pdfmake'

const fonts = {
	Roboto: {
		normal: 'src/assets/fonts/Roboto-Regular.ttf',
		bold: 'src/assets/fonts/Roboto-Medium.ttf',
		italics: 'src/assets/fonts/Roboto-Italic.ttf',
		bolditalics: 'src/assets/fonts/Roboto-MediumItalic.ttf'
	}
}
const printer = new PdfPrinter(fonts)

export function createPdf(content: any, options = {}) {
	const docDefinition = {
		content,
		pageMargins: 15,
		defaultStyle: {
			fontSize: 10
		}
	}

	const pdfDoc = printer.createPdfKitDocument(docDefinition, options)

	return new Promise((resolve, reject) => {
		try {
			const chunks: any[] = []
			pdfDoc.on('data', (chunk: any) => chunks.push(chunk))
			pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
			pdfDoc.end()
		} catch (err) {
			reject(err)
		}
	})
}
