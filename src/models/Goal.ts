import mongoose from 'mongoose'

export type GoalType = mongoose.Document & {
	month: string // unique
	companies: Array<{
		id: string
		sellers: Array<{
			id: string
			goal: number
		}>
		eCommerceGoal: number
	}>
	modifiedAt?: string
}

const GoalSchema = new mongoose.Schema({
	month: {type: String, required: true, unique: true},
	companies: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Representada',
				required: true
			},
			sellers: [
				{
					id: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Vendedor',
						required: true
					},
					goal: {type: Number, required: true}
				}
			],
			eCommerceGoal: {type: Number, required: true}
		}
	],
	modifiedAt: {type: String}
})

export default mongoose.model<GoalType>('Goal', GoalSchema)
