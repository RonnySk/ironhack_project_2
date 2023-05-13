const Flat = require('../models/Flat.model');

const isAdmin = async (req, res, next) => {
	const flat = await Flat.findOne({ users: req.session.user.id });

	if (flat.owner == req.session.user.id) {
		let userIsAdmin = true;
		next();
		return;
	}
};

module.exports = isAdmin;
