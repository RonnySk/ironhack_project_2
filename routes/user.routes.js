const bcryptjs = require('bcryptjs');
const router = require('express').Router();
const isLoggedOut = require('../middlewares/isLoggedOut');
const isLoggedIn = require('../middlewares/isLoggedIn');
const isPartOfFlat = require('../middlewares/isPartOfFlat');
const User = require('../models/User.model');
const Flat = require('../models/Flat.model');
const Task = require('../models/Task.model');

// signup route

router.get('/signup', (req, res) => {
	res.render('auth/signup');
});

router.post('/signup', async (req, res, next) => {
	try {
		const salt = await bcryptjs.genSalt(12);
		const hash = await bcryptjs.hash(req.body.password, salt);
		const newUser = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: hash,
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
		};

		const flat = await Flat.findOne({ users: req.session.user.id }).populate('users');
		if (flat) {
			res.redirect('flat/' + flat.id);
		} else {
			res.redirect('flat/flat-details');
		}
	} catch (err) {
		next(err);
	}
});

// flat route

router.get('/flat/:id', isLoggedIn, isPartOfFlat, async (req, res, next) => {
	try {
		const { id } = req.params.id;
		const flat = await Flat.findOne({ users: req.session.user.id }).populate('users');
		const allUsers = await User.find();
		const tasks = await Task.find({ flatId: req.params.id }).populate('user');

		res.render('flat/flat-details', { allUsers, flat, tasks });
	} catch (err) {
		next(err);
	}
});

router.post('/flat', async (req, res, next) => {
	try {
		const newFlat = await Flat.create({
			name: req.body.flatName,
			users: req.body.flatMembers,
			owner: req.session.user.id,
		});
		res.redirect('flat/' + newFlat.id);
	} catch (err) {
		next(err);
	}
});

// create-flat route

router.get('/create-flat', async (req, res, next) => {
	try {
		const allUsers = await User.find();
		res.render('flat/create-flat', { allUsers });
	} catch (err) {
		next(err);
	}
});

// edit name of flat route

router.get('/flat/:id/edit', async (req, res, next) => {
	try {
		const flatToEdit = await Flat.findById(req.params.id);
		res.render('flat/edit-flatname', { flatToEdit });
		console.log('flat to edit is:', flatToEdit);
	} catch (err) {
		next(err);
	}
});

// update name of flat route

router.post('/flat/:id/update', async (req, res, next) => {
	try {
		const flatId = req.params.id;
		const { name } = req.body;
		const updatedFlat = await Flat.findByIdAndUpdate(flatId, { name }, { new: true });
		res.redirect('/flat/' + flatId);
	} catch (err) {
		next(err);
	}
});

// delete flatmate route

router.post('/flat/:flatId/user/:userId/delete', async (req, res, next) => {
	try {
		const { flatId, userId } = req.params;
		const flat = await Flat.findByIdAndUpdate(flatId, { $pull: { users: userId } }, { new: true });
		res.redirect('/flat/' + flat.id);
	} catch (err) {
		next(err);
	}
});

// add flatmate route
router.get('/flat/:id/add-flatmate', async (req, res, next) => {
	try {
		const flat = await Flat.findById(req.params.id);
		const allUsers = await User.find({ _id: { $nin: flat.users } });
		res.render('flat/add-flatmate', { flat, allUsers });
	} catch (err) {
		next(err);
	}
});

router.post('/flat/:flatId/add-flatmate', async (req, res, next) => {
	try {
		const { flatId } = req.params;
		const { newFlatMate } = req.body;
		const flat = await Flat.findByIdAndUpdate(flatId, { $push: { users: newFlatMate } }, { new: true });
		res.redirect('/flat/' + flat.id);
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

// add task route

router.post('/flat/:id', async (req, res, next) => {
	const flat = await Flat.findOne({ users: req.session.user.id }).populate('users');

	const newTask = await Task.create({
		name: req.body.taskname,
		description: req.body.taskdescription,
		user: req.body.taskuser,
		flatId: flat.id,
	});

	res.redirect('/flat/' + flat.id);
	try {
	} catch (err) {
		next(err);
	}
});

// delete task route

// update task route

// delete User route

module.exports = router;
