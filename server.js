require('dotenv').config()
const Application = require('./app')
global.config = require('./config')

new Application();
