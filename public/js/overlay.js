const sleep = ms => new Promise(r => setTimeout(r, ms));

let hls;

/**
 * @type {HTMLVideoElement}
 */
let video;

async function reloadStream(source) {
	if(!hls) {
		hls = new Hls({
			liveSyncDurationCount: 2,
			
			manifestLoadingMaxRetry: 3,
		});
	} else hls.detachMedia();
	if(video) video.remove();
	
	video = document.createElement("video");
	if(Hls.isSupported()) {
		hls.loadSource(source);
		hls.attachMedia(video);

		hls.on(Hls.Events.ERROR, (event, data) => {
			console.log(data);
		});

	} else {
		video.src = "content/vid/loop1.mp4";
	}
	
	// video.addEventListener('error', function(evt) {
	// 	var errorTxt,mediaError=evt.currentTarget.error;
	// 	console.log(errorTxt);
	// 	console.log(mediaError);
	// })


	$("#game-placeholder").append(video);

	video.addEventListener("canplay", () => {console.log("apple");video.play()});
	
}

setTimeout(() => {
	reloadStream("/content/vid/live.m3u8");
}, 1000);