require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");
const jwtToken = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (!token)
		return res.status(403).json({ message: "You need to login to proceed" });
	jwtToken.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
		if (err) return res.status(401).json({ message: "Invalid Token" });
		req.user = user;
		next();
	});
};

router.get("/", (req, res, next) => {
	if (req.session.viewCount) {
		req.session.viewCount += 1;
	} else req.session.viewCount = 1;
	console.log(req.session.user);
	res.status(200).json({
		message: "Auth Page Routing works.",
		views: req.session.viewCount,
	});
});
router.post("/register", async (req, res, next) => {
	const { username, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({
			username: username,
			password: hashedPassword,
		});
		await user.save();
		const token = jwtToken.sign(
			{ userId: user._id, username: user.username },
			process.env.ACCESS_TOKEN_SECRET_KEY
		);

		return res
			.status(201)
			.json({ message: "User Created", user: username, token: token });
	} catch (err) {
		res.status(401).json({ error: "There is an error creating User" });
	}
});

router.post("/login", async (req, res, next) => {
	const { username, password } = req.body;

	try {
		const user = await User.findOne({ username: username });
		console.log(user);
		if (!user)
			return res.status(401).json({ error: "Invalid Login Credentials" });
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch)
			return res.status(401).json({ error: "Invalid Login Credentials" });

		const token = jwtToken.sign(
			{ userId: user._id, username: user.username },
			process.env.ACCESS_TOKEN_SECRET_KEY
		);

		return res.status(200).json({ user: username, token: token });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Login Error", detailedError: err });
	}
});

module.exports = { router, authenticateToken };
