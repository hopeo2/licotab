const express = require("express");
const router = express.Router();

const homeController = require("../../../http/controllers/api/v1/homeController")


router.get('/user', homeController.index)
router.get('/user/history', homeController.history)



module.exports = router;