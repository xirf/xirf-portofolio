const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'secret';
const salt = bcrypt.genSaltSync(12);
const password = 'password';
const hash = bcrypt.hashSync(password + secret, salt);


