const router = require('express').Router();
const Task = require('../models/Task.model');

// add task route

router.post('/flat/:id', async (req, res, next) => {
	const flatId = req.params.id;

	const newTask = await Task.create({
		name: req.body.taskname,
		description: req.body.taskdescription,
		user: req.body.taskuser,
		flatId: flatId,
	});

	res.redirect('/flat/' + flatId);
	try {
	} catch (err) {
		next(err);
	}
});

// delete task route

router.post('/flat/:flatId/task/:taskId/delete', async (req, res, next) => {
	try {
		const { flatId, taskId } = req.params;
		const task = await Task.findByIdAndDelete({ _id: taskId });
		res.redirect('/flat/' + flatId);
	} catch (err) {
		next(err);
	}
});

// update task route

router.post('/flat/:flatId/task/:taskId/update', async (req, res, next) => {
	try {
		const { flatId, taskId } = req.params;
		const task = await Task.findById({ _id: taskId });

		if (task.isDone == false) {
			const task = await Task.findByIdAndUpdate(taskId, { isDone: true }, { new: true });
		} else {
			const task = await Task.findByIdAndUpdate(taskId, { isDone: false }, { new: true });
		}

		res.redirect('/flat/' + flatId);
	} catch (err) {
		next(err);
	}
});

module.exports = router;
