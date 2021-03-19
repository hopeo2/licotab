const express = require('express');
const router = express.Router();

const authenticateApi = require('../../../http/middleware/authenticateApi');

const forEveryOne = require('./public.js');
const forUser = require('./private');

router.use(forEveryOne);
router.use(authenticateApi.handle ,forUser);


module.exports = router; 