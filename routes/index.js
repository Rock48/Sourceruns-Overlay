"use strict";

const express = require("express");
const path = require("path");
const index = express.Router();


function getPagePath(page) {
	return path.join(__dirname, "..", "pages", page)
}

index.get("/", async (req, res) => {
	let height = req.query.height ? +req.query.height : 720;

	if(isNaN(height) || /^(720|1080)$/.test(height)) {
		height = 720;
	}

	const width = Math.round(height * 16 / 9);

	res.render("overlay", {height, width});
});

module.exports = index;