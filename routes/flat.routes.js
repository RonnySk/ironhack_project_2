const bcryptjs = require('bcryptjs');
const router = require('express').Router();
const isLoggedOut = require('../middlewares/isLoggedOut');
const isLoggedIn = require('../middlewares/isLoggedIn');
const isPartOfFlat = require('../middlewares/isPartOfFlat');
const User = require('../models/User.model');
const Flat = require('../models/Flat.model');
const Task = require('../models/Task.model');

// all flats route

const mongoose = require('mongoose');
router.get('/flat', isLoggedIn, async (req, res, next) => {
	try {
		const allFlats = await Flat.find({ users: req.session.user.id });
		const allUsers = await User.find({
			_id: { $ne: new mongoose.Types.ObjectId(req.session.user.id) },
		});
		res.render('flat/flat', { allFlats, allUsers });
	} catch (err) {
		next(err);
	}
});

// flat details route

router.get('/flat/:id', isLoggedIn, isPartOfFlat, async (req, res, next) => {
	try {
		const { id } = req.params.id;
		const flat = await Flat.findById({ _id: req.params.id }).populate('users');
		const allUsers = await User.find();
		const tasks = await Task.find({ flatId: req.params.id }).populate('user').lean().sort({ user: 1 });
		const updatedTasks = tasks.map((task) => {
			if (task.user._id.toString() === req.session.user.id) {
				task.isOwner = true;
			} else {
				task.isOwner = false;
			}
			return task;
		});

		let hasOverdueTasks = false;
		const d = new Date();
		let day = d.getDay();
		if (day === 6 || day === 0) {
			for (let i = 0; i < updatedTasks.length; i++) {
				if (updatedTasks[i].isOwner == true && updatedTasks[i].isDone == false) {
					hasOverdueTasks = true;
				}
			}
		}

		if (flat.owner == req.session.user.id) {
			res.render('flat/flat-details', {
				allUsers,
				flat,
				tasks,
				updatedTasks,
				hasOverdueTasks,
				userIsAdmin: true,
			});
		} else {
			res.render('flat/flat-details', {
				allUsers,
				flat,
				tasks,
				updatedTasks,
				hasOverdueTasks,
				userIsAdmin: false,
			});
		}
	} catch (err) {
		next(err);
	}
});

// create flat route

router.post('/create-flat', async (req, res, next) => {
	try {
		let usersArr;
		if (Array.isArray(req.body.flatMembers)) {
			usersArr = req.body.flatMembers;
		} else {
			usersArr = [];
			usersArr.push(req.body.flatMembers);
		}
		const newFlat = await Flat.create({
			name: req.body.flatName,
			users: [req.session.user.id, ...usersArr],
			owner: req.session.user.id,
		});
		res.redirect('flat/' + newFlat.id);
	} catch (err) {
		next(err);
	}
});

// delete Flat route

router.post('/flat/:flatId/delete', async (req, res, next) => {
	try {
		const { flatId } = req.params;
		const flatToDelete = await Flat.findByIdAndDelete({ _id: flatId });
		res.redirect('/flat');
	} catch (err) {
		next(err);
	}
});

router.post('/flat/:flatId/delete/:userId', async (req, res, next) => {
	try {
		const { flatId, userId } = req.params;
		const flatToDelete = await Flat.findByIdAndDelete({ _id: flatId });
		res.redirect('/user/' + userId + '/delete');
	} catch (err) {
		next(err);
	}
});

// update flat name route

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

// update flat owner route

router.post('/flat/:id/update/owner/:userId', async (req, res, next) => {
	try {
		const flatId = req.params.id;
		const userId = req.params.userId;
		const newOwnerId = req.body.flatMembers;
		const updatedFlat = await Flat.findByIdAndUpdate(flatId, { owner: newOwnerId }, { new: true });
		res.redirect('/flat/' + flatId);
	} catch (err) {
		next(err);
	}
});

router.post('/flat/:id/update/owner/:userId/settings', async (req, res, next) => {
	try {
		const flatId = req.params.id;
		const userId = req.params.userId;
		const newOwnerId = req.body.flatMembers;
		const updatedFlat = await Flat.findByIdAndUpdate(flatId, { owner: newOwnerId }, { new: true });
		res.redirect('/user/' + userId + '/delete');
	} catch (err) {
		next(err);
	}
});

// delete flatmate route

router.post('/flat/:flatId/user/:userId/delete', async (req, res, next) => {
	try {
		const { flatId, userId } = req.params;
		const flatIsOwner = await Flat.find({ _id: flatId, owner: { $eq: new mongoose.Types.ObjectId(userId) } });

		if (flatIsOwner.length === 0) {
			const flat = await Flat.findByIdAndUpdate(flatId, { $pull: { users: userId } }, { new: true });
			res.redirect('/flat/' + flatId);
		} else {
			console.log('TRYING TO DELETE FLAT OWNER', flatIsOwner);
			res.redirect('/flat/' + flatId);
		}
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

module.exports = router;
