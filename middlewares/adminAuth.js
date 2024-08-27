const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Access denied. User not authenticated.' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};
module.exports = authorizeAdmin;