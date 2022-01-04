'use strict';

/**
 * Authentication and user routes.
 * 
 * @author: Sofie Wallin
 */

const router = require('express').Router();

router.post('/register', (req, res) => {
    res.send('Register');
});

/* 1. Exports router */

module.exports = router;