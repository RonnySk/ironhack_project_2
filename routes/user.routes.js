const bcryptjs = require('bcryptjs');
const router = require('express').Router();
const User = require('../models/User.model');
const uploader = require('../middlewares/cloudinary.config.js');

// signup route

router.get('/signup', (req, res) => {
	res.render('auth/signup');
});

router.post('/signup', uploader.single('imageUrl'), async (req, res, next) => {
	try {
		const salt = await bcryptjs.genSalt(12);
		const hash = await bcryptjs.hash(req.body.password, salt);
		const newUser = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: hash,
			ImgUrl: req.file.path,
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
		console.log('REQ:BODY', req.body);
		if (!req.file.path) {
			console.log('NO FILE THERE');
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				username: req.body.userName,
				email: req.body.emailAddress,
				ImgUrl: req.file.path,
			},
			{ new: true }
		);

		req.session.user = {
			id: userId,
			name: req.body.userName,
			ImgUrl: req.file.path,
		};

		res.redirect('/flat/');
	} catch (err) {
		next(err);
	}
});

// delete user route

router.get('/user/:userId/delete', async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUser = await User.findById(userId);

		currentUsersFlats = await Flat.find({ owner: userId }).populate('users');

		res.render('user/delete-user', { currentUser, currentUsersFlats });
	} catch (err) {
		next(err);
	}
});

// router.post('/user/:userId/delete', async (req, res, next) => {
// 	const { userId } = req.params;
// 	const userToDelete = await User.findByIdAndDelete({ _id: userId });
// 	res.redirect('/');
// });

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
