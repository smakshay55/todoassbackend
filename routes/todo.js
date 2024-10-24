require("dotenv").config();
const express = require("express");
const router = express.Router();

const { authenticateToken } = require("./auth");
const ToDo = require("../models/todo");

router.get("/", authenticateToken, async (req, res, next) => {
	try {
		const todos = await ToDo.find({ user: req.user.userId });
		if (todos.length === 0)
			return res.status(200).json({ message: "You don't have any todo" });
		res.status(200).json(todos);
	} catch (err) {
		res.status(403).json({ message: "Some kind of error..." });
	}
});

router.post("/", authenticateToken, async (req, res, next) => {
	const { title } = req.body;

	try {
		const todo = new ToDo({ title: title, user: req.user.userId });
		await todo.save();
		res.status(201).json(todo);
	} catch (err) {
		res.status(400).json({ message: "Unknown error happened" });
	}
});

router.get("/:todoid", authenticateToken, async (req, res, next) => {
	const todoid = req.params.todoid;
	try {
		const todo = await ToDo.findById(todoid);

		if (!todo)
			return res.status(404).json({ message: "No todo exist with that ID" });
		else if (!todo.user.equals(req.user.userId)) {
			return res.status(403).json({ message: "You don't own that ToDo" });
		}
		res.status(200).json(todo);
	} catch (err) {
		res.status(403).json({ message: "Unable to get that todo" });
	}
});

router.patch("/:todoid", authenticateToken, async (req, res, next) => {
	const todoid = req.params.todoid;
	const { completed } = req.body;
	let todo;
	try {
		todo = await ToDo.findById(todoid);
		if (!todo) {
			return res.status(404).json({ message: "No todo exist with that ID" });
		} else if (!todo.user.equals(req.user.userId)) {
			return res.status(403).json({ message: "You don't own that ToDo" });
		} else {
			todo = await ToDo.findByIdAndUpdate(
				todoid,
				{ completed: completed },
				{ new: true }
			);
			res.status(201).json(todo);
		}
	} catch (err) {
		res.status(400).json({ message: "Unknown error happened" });
	}
});

router.delete("/:todoid", authenticateToken, async (req, res, next) => {
	const todoid = req.params.todoid;
	let todo;
	try {
		todo = await ToDo.findById(todoid);
		if (!todo) {
			return res.status(404).json({ message: "No todo exist with that ID" });
		} else if (!todo.user.equals(req.user.userId)) {
			return res.status(403).json({ message: "You don't own that ToDo" });
		} else {
			todo = await ToDo.findByIdAndDelete(todoid);
			res.status(204).json(todo);
		}
	} catch (err) {
		res.status(400).json({ message: "Unknown error happened" });
	}
});

module.exports = router;
