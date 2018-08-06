"use strict";

const express = require("express");
const api = express.Router();

api.get("/", async (req, res) => {
	res.json({success: false, message: "API not implemented"});
});

module.exports = api;