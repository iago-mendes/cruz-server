const {Seeder} = require('mongo-seeding')
const path = require('path')

const config =
{
	database:
	{
    name: 'cruz',
  }
}

const seeder = new Seeder(config)

const collections = seeder.readCollectionsFromPath(path.join(__dirname, 'data'))

seeder.import(collections)
	.then(() => console.log('collections seeded successfully to db!'))
	.catch(error => console.error(error))