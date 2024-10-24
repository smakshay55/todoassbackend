const mongoose = require("mongoose");

const todoSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	completed: {
		type: Boolean,
		default: false,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

const ToDo = mongoose.model("ToDo", todoSchema);

module.exports = ToDo;
