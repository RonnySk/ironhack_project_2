const bcryptjs = require("bcryptjs");
const router = require("express").Router();
const User = require("../models/User.model");
const Flat = require("../models/Flat.model");
const Task = require("../models/Task.model");

// signup route

router.get('/signup', (req, res) => {
    res.render("signup")
});

// router.post()


module.exports = router;


