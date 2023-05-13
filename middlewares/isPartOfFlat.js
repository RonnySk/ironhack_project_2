const Flat = require("../models/Flat.model");

const isPartOfFlat = async (req, res, next) => {
    const flat = await Flat.findOne({users: req.session.user.id});
    if (flat) {
        next();
        return;
    } else {
         res.redirect('/flat');
    }

};

module.exports = isPartOfFlat;