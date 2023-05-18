const bcryptjs = require('bcryptjs');
const router = require('express').Router();
const isLoggedOut = require('../middlewares/isLoggedOut');
const isLoggedIn = require('../middlewares/isLoggedIn');
const User = require('../models/User.model');
const Flat = require('../models/Flat.model');
const uploader = require('../middlewares/cloudinary.config.js');

// signup route

router.get('/signup', (req, res) => {
	res.render('auth/signup');
});

router.post('/signup', uploader.single('imageUrl'), async (req, res, next) => {
	try {
		const salt = await bcryptjs.genSalt(12);
		const hash = await bcryptjs.hash(req.body.password, salt);
		let imgUrl;

		if (req.file) {
			imgUrl = req.file.path;
		}

		const newUser = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: hash,
			ImgUrl: imgUrl,
		});
		await newUser.save();
		res.render('auth/login', newUser);
	} catch (err) {
		next(err);
	}
});

//login route

router.get('/login', (req, res) => {
	res.render('auth/login');
});

router.post('/login', async (req, res, next) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			return res.render('auth/login', { error: 'User not existent!' });
		}
		const passwordsMatch = await bcryptjs.compare(req.body.password, user.password);
		if (!passwordsMatch) {
			return res.render('auth/login', {
				error: 'Sorry the password is incorrect!',
			});
		}

		req.session.user = {
			id: user._id,
			name: user.username,
			ImgUrl: user.ImgUrl,
		};

		res.redirect('/flat');
	} catch (err) {
		next(err);
	}
});

// user settings route

router.get('/user/:userId', async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUser = await User.findById(userId);
		res.render('user/user-settings', { currentUser });
	} catch (err) {
		next(err);
	}
});

router.post('/user/:userId/update', uploader.single('imageUrl'), async (req, res, next) => {
	try {
		// const salt = await bcryptjs.genSalt(12);
		// const hash = await bcryptjs.hash(req.body.password, salt);
		const userId = req.params.userId;
		const currentUser = await User.findById({ _id: userId });

		let theImageUrl = currentUser.ImgUrl;

		if (req.file) {
			theImageUrl = req.file.path;
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				username: req.body.userName,
				email: req.body.emailAddress,
				ImgUrl: theImageUrl,
			},
			{ new: true }
		);

		req.session.user = {
			id: userId,
			name: updatedUser.username,
			ImgUrl: theImageUrl,
		};

		res.redirect('/flat/');
	} catch (err) {
		next(err);
	}
});

// delete user route

router.get('/user/:userId/delete', isLoggedIn, async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUser = await User.findById(userId);

		currentUsersFlats = await Flat.find({ owner: userId }).populate('users');

		res.render('user/delete-user', { currentUser, currentUsersFlats });
	} catch (err) {
		next(err);
	}
});

const mongoose = require('mongoose');
router.post('/user/:userId/delete', async (req, res, next) => {
	try {
		const { userId } = req.params;
		deleteUserFromFlats = await Flat.updateMany(
			{},
			{ $pull: { users: { $in: [new mongoose.Types.ObjectId(userId)] } } },
			{ new: true }
		);
		const userToDelete = await User.findByIdAndDelete({ _id: userId });

		req.session.destroy((err) => {
			if (err) {
				next(err);
				return;
			}
			res.redirect('/goodbye');
		});
	} catch (err) {
		next(err);
	}
});

// delete user successful route

router.get('/goodbye', async (req, res, next) => {
	try {
		res.render('user/delete-user-success');
	} catch (err) {
		next(err);
	}
});

// logout route

router.post('/logout', (req, res, next) => {
	req.session.destroy((err) => {
		if (err) {
			next(err);
			return;
		}
		res.redirect('/');
	});
});

module.exports = router;
