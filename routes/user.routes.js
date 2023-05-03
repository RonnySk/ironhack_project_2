const bcryptjs = require("bcryptjs");
const router = require("express").Router();
const User = require("../models/User.model");
const Flat = require("../models/Flat.model");
const Task = require("../models/Task.model");

// signup route

router.get('/signup', (req, res) => {
    res.render("signup");
});

router.post('/signup', async (req,res) => {
   
        const salt = await bcryptjs.genSalt(12);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const newUser = await User.create({username: req.body.username, email: req.body.email, password: hash}); 
        console.log(newUser)
        res.render("homePage", newUser)

})


module.exports = router;


