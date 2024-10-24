require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");

const port = process.env.PORT || 5000;

const connectDB = async () => {
	await mongoose.connect(process.env.MONGODB_URL);
};

connectDB().catch((err) => {
	console.log({ error: err });
});

app.use(express.json());
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Credentials", true);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PATCH, DELETE, OPTIONS, HEAD"
	);
	next();
});

app.use("/auth", authRoutes.router);
app.use("/todo", todoRoutes);

app.get("/", (req, res) => {
	res.status(200).json({
		heading: "Welcome to the user restricted todo app",
	});
});

app.listen(port, () => {
	console.log(`Listening at ${port}`);
});
