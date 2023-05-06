const bcryptjs = require("bcryptjs");
const router = require("express").Router();
const isLoggedOut = require("../middlewares/isLoggedOut");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isPartOfFlat = require("../middlewares/isPartOfFlat");
const User = require("../models/User.model");
const Flat = require("../models/Flat.model");
const Task = require("../models/Task.model");

// signup route

router.get('/signup', (req, res) => {
    res.render("auth/signup");
});

router.post('/signup', async (req,res,next) => {
    try {
        const salt = await bcryptjs.genSalt(12);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const newUser = await User.create({username: req.body.username, email: req.body.email, password: hash}); 
        await newUser.save();
        console.log(newUser)
        res.render("auth/login", newUser)
    } catch (err){ 
        next(err);
    }
})

//login route

router.get('/login', (req, res) => {
    res.render("auth/login");
});

router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user) {
            return res.render("auth/login", {error: "User not existent!"});
        }
        const passwordsMatch = await bcryptjs.compare(
            req.body.password, user.password
        );
        if(!passwordsMatch) {
            return res.render("auth/login", {error: "Sorry the password is incorrect!"})
        }
             
        req.session.user = user._id;
        res.redirect('flat')
    } catch (err){ 
        next(err);
    }
})

// flat route

router.get('/flat', isLoggedIn, isPartOfFlat, async (req, res) => {
    const flat = await Flat.findOne({users: req.session.user});
    // console.log("our Flat, ", flat);
    const allUsers = await User.find();
    res.render('flat', {allUsers, flat});
});


router.post('/flat', async (req, res, next) => {
    try {
        const newFlat = await Flat.create({name: req.body.flatName, users: req.body.flatMembers, owner: req.session.user});
        console.log("IS THIS THE USER ID?", req.session.user);
        res.redirect('flat')
    } catch (err){ 
        next(err);
    }
});

// create-flat route

router.get('/create-flat', (req, res) => {
    res.render("create-flat");
});


module.exports = router;



    
    // router.get('/:id', async (req,res) => {
    //     try {
    //         const oneMovie = await MovieModel.findById(req.params.id).populate("cast");
    //         // console.log("params", oneMovie)
    //         res.render('movies/movie-details', {oneMovie})
    //     } catch {(err) =>
    //         console.log("Error to acess the movie by ID on DB: ", err)
    //         }; 
    // });