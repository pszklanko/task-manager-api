const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id, 'tokens.token': token });
        
        if (user) {
            req.user = user;
            req.token = token;
            next();
        } else {
            throw new Error();
        }
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate!' });
    }
}; 

module.exports = auth;