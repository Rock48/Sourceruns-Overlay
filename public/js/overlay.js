const sleep = ms => new Promise(r => setTimeout(r, ms));

let hls;
let stream_active;

function recreateVideoElement() {
	if($("#game-placeholder video").length) $("#game-placeholder video").remove();
	const video = document.createElement("video");
	$("#game-placeholder").append(video);

	video.addEventListener("canplay", () => {
		console.log("Video Ready.");
		video.play();
	});

	return video;
}

function offlineLoop() {
	stream_active = false;
	hls.detachMedia();
	const video = recreateVideoElement();
	video.src = "content/vid/loop1.mp4";
	video.loop = 1;
}

async function reloadStream(source) {
	hls.detachMedia();
	hls.loadSource(source);
}

if(Hls.isSupported()) {
	hls = new Hls({
		liveSyncDurationCount: 2,
		manifestLoadingMaxRetry: 3
	});
	
	hls.on(Hls.Events.ERROR, (event, data) => {
		console.log(`HLS Error! Type: ${data.type} Details: ${data.details} Fatal: ${data.fatal}`);
		if(data.fatal) {
			offlineLoop();
		}
	});

	hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
		console.log("Stream manifest loaded!");
		stream_active = true;
		const video = recreateVideoElement();
		hls.attachMedia(video);
	});

	setTimeout(() => {
		reloadStream("/content/vid/live.m3u8");
	}, 1000);
}