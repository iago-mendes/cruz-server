import ObjectID from 'bson-objectid'

export function handleObjectId(_id?: string) {
	if (!_id || _id.length !== 24) return new ObjectID()

	return new ObjectID(_id)
}
