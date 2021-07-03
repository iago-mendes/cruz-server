import {factory} from 'factory-girl'

import Company from '../../src/models/Company'
import {companyDefinition} from './company'

factory.define('Company', Company, companyDefinition)

export default factory
