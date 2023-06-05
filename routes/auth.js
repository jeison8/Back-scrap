/* Router for authentication - /auth/login */

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { createUser,updateUser,login,reValidateToken,consult,destroy,access } = require('../controllers/auth');
const { validateFields } = require('../middlewares/field-validators');
const { validateJwt } = require('../middlewares/validate-jwt');

router.post('/login',[
    check('document','El documento es obigatorio').not().isEmpty(),
    check('document','El password es obigatorio').not().isEmpty(),
    validateFields
],login);

router.post('/access',[
    check('document','El documento es obigatorio').not().isEmpty(),
    validateFields
], access);

router.get('/consult',[ 
    validateJwt 
], consult);

router.post('/new',[
    validateJwt,
    check('document','El documento es obigatorio').not().isEmpty(),
    check('name','El documento es obigatorio').not().isEmpty(),
    check('cost','El valor es obigatorio').not().isEmpty(),
    check('dateStart','La fecha es obigatoria').not().isEmpty(),
    check('dateEnd','La fecha final no esta presente').not().isEmpty(),
    validateFields 
],createUser);

router.put('/update/:id',[
    validateJwt,
],updateUser);

router.get('/destroy/:id',[ 
    validateJwt 
], destroy);

router.get('/renew', [ 
    validateJwt 
], reValidateToken);

module.exports = router;
