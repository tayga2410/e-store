const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Token:', token); 

    if (!token) {
        console.log('Token missing');
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err); 
            return res.status(403).json({ error: 'Invalid token' });
        }
        console.log('Token is valid. User:', user);
        req.user = user;
        next();
    });
}

function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        console.log('User role:', req.user.role);
        if (!allowedRoles.includes(req.user.role)) {
            console.error(`Access denied: Required roles are ${allowedRoles}, but user role is ${req.user.role}`);
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}



module.exports = { authenticateToken, authorizeRole };
