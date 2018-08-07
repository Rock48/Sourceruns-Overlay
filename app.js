'use strict';

require('dotenv').config();

const path = require('path')
const fs = require('fs');
const {ifDebug} = require("./modules/helpers");

const request = require('request-promise-native');
const express = require('express');
const HLSServer = require('hls-server');
const ffmpeg = require("fluent-ffmpeg");


const app = express();

const index = require('./routes/index');
const api = require('./routes/api');

const PUBLIC_DIR = Object.freeze(path.join(__dirname, "public"))
const VIDEO_DIR = Object.freeze(path.join(PUBLIC_DIR, "vid"))

app.set('view engine', 'ejs');

app.use("/", index);
app.use("/api", api);

ifDebug(() => {
	app.use("/content", express.static(PUBLIC_DIR));
})

const server = app.listen(process.env.PORT, () => {
	console.log(`HTTP Server listening on port ` + process.env.PORT);
	ifDebug(() => console.log("NODE_ENV SET TO " + process.env.NODE_ENV))	
})

const hls = new HLSServer(app, {
	path: "/streams",
	dir: "public/vid"
});


let current_stream = null;

/**
 * @param {string} dir_path
 * @returns {Promise<void>}
 */
function unlinkAsync(path) {
	return new Promise((done, fail) => {
		fs.unlink(path, err => err ? fail(err) : done());
	});
}

/**
 * @param {string} dir_path
 * @returns {Promise<string[]>} files
 */
function readdirAsync(dir_path) {
	return new Promise((done, fail) => {
		fs.readdir(dir_path, (err, files) => err ? fail(err) : done(files));
	});
}

const PLAYLIST_FILE = path.join(VIDEO_DIR, "live.m3u8");
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function newRtmpStream(ip, key) {
	const uri = `rtmp://${ip}/${key}`;

	if(current_stream != null) {
		current_stream.kill();
	}

	if(fs.existsSync(PLAYLIST_FILE)) await unlinkAsync(PLAYLIST_FILE);

	let files = await readdirAsync(VIDEO_DIR);
	files = files.filter(name => name.match(/\.ts(.tmp)?$/i));
	
	const promises = new Array(files.length);
	for(let i = 0; i < files.length; i++) {
		promises[i] = unlinkAsync(path.join(VIDEO_DIR, files[i]));
	}

	await Promise.all(promises);

	current_stream = ffmpeg(uri).addOption([
		'-c:v copy',
		'-f hls',
		'-hls_delete_threshold 2',
		'-hls_list_size 5',
		'-hls_time 2',
		'-hls_start_number_source epoch',
		'-hls_flags delete_segments+temp_file+split_by_time',
		'-hls_allow_cache 0'
	]).output(PLAYLIST_FILE);

	current_stream.on("error", async (...args) => {
		console.error(...args);
		console.log("Waiting 5 seconds")
		await sleep(5000);
		newRtmpStream(ip, key);
	});
	
	current_stream.on("end", async (...args) => {
		console.log("Stream Ended.");
	})

	current_stream.run();
}

newRtmpStream("142.93.96.108", "live/streamkey");