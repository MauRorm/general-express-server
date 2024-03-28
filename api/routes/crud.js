const express = require('express');
const router = express.Router();
const { getList, getItemDetail, } = require('../controllers/listControllers');

router.get('/api/get/elements', getList);

router.get('/api/get/item/detail/:id', getItemDetail);

module.exports = router