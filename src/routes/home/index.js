const express = require('express');
const router = express.Router();

const ctrl = require('./home.ctrl');

router.get('/', ctrl.home);

router.get('/memberfind', ctrl.memberfind);

router.get('/membership', ctrl.membership);

router.get('/test-make', ctrl.test_make);

router.get('/dispose-01', ctrl.dispose_01);

module.exports = router;