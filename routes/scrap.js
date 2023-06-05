/* Router for scrap - /auth/scrap */

const express = require('express');
const router = express.Router();
// const { check } = require('express-validator');
const { search } = require('../controllers/scrap');

router.get('/search',search);

module.exports = router;
