const state = require("./state.js");
const fs = require("fs");
const videoshow = require("videoshow");
const naturalSort = require("javascript-natural-sort");
const gm = require("gm").subClass({
	imageMagick: true
});

const originalDir = "./content/images/";
const resizedDir = "./content/images/resized/";

async function robot() {
	const content = state.load();
	content.images = await acquireImages();
	content.imagesInfo = await setImagesInfo();
	await state.save(content);
	await createVideo();

	async function acquireImages() {
		console.log("> [video-generator] Acquiring Images");
		originalFiles = fs.readdirSync(originalDir);
		imagesList = [];
		originalFiles.forEach(file => {
			if (file.slice(-3) == "png") {
				imagesList.push({
					filePath: originalDir + file,
					fileName: file.slice(0, -8)
				});
			}
		});

		for await (const image of imagesList) {
			await convertImage(image);
		}

		return populateImageList();
	}

	async function convertImage(image) {
		console.log("> [video-generator] Converting image");
		return new Promise((resolve, reject) => {
			const inputFile = image.filePath;
			const outputFile = `${resizedDir}${image.fileName}-converted.png`;
			const width = 1920;
			const height = 1080;

			gm()
				.in(inputFile)
				.out("(")
				.out("-clone")
				.out("0")
				.out("-background", "white")
				.out("-blur", "0x9")
				.out("-resize", `${width}x${height}^`)
				.out(")")
				.out("(")
				.out("-clone")
				.out("0")
				.out("-background", "white")
				.out("-resize", `${width}x${height}`)
				.out(")")
				.out("-delete", "0")
				.out("-gravity", "center")
				.out("-compose", "over")
				.out("-composite")
				.out("-extent", `${width}x${height}`)
				.write(outputFile, error => {
					if (error) {
						return reject(error);
					}
					resolve();
				});
		});
	}

	async function populateImageList() {
		resizedFilenames = fs.readdirSync(resizedDir).sort(naturalSort);
		resizedImagesList = [];
		for (const file of resizedFilenames) {
			if (file.slice(-3) == "png") {
				resizedImagesList.push(resizedDir + file);
			}
		}

		return resizedImagesList;
	}

	function setImagesInfo() {
		console.log("> [video-generator] Setting images info");
		timestamps = getImagesTimestamps();
		imagesInfo = [];
		images = content.images;
		for (let i = 0; i < images.length; i++) {
			index = getSentencesIndex(i);
			caption = getImageCaption(index);
			imagesInfo.push({
				path: images[i],
				loop: setImageTime(timestamps, i),
				caption: caption
			});
		}
		return imagesInfo;
	}

	function getImageCaption(index) {
		if (content.sentences[index] != undefined) {
			return content.sentences[index].text;
		} else {
			return "---";
		}
	}

	function getImagesTimestamps() {
		images = content.images;
		nextImage = 0;
		imagesTimestamps = [];
		for (const image of images) {
			nextImage = images.indexOf(image) + 3;
			nextImageBeyondLimit = nextImage > images.length - 4;
			if (!nextImageBeyondLimit) {
				imagesTimestamps.push({
					startTime: processImagesTimestamps(image)[0],
					endTime: processImagesTimestamps(images[nextImage])[0]
				});
			} else {
				lastImageTimestamp = imagesTimestamps.length - 1;
				imagesTimestamps.push({
					startTime: imagesTimestamps[lastImageTimestamp]["endTime"],
					endTime: imagesTimestamps[lastImageTimestamp]["endTime"] + 3
				});
			}
		}

		return imagesTimestamps;
	}

	function getSentencesIndex(i) {
		if ((i - 2) % 3 == 0) {
			return (i - 2) / 3;
		} else if ((i - 1) % 3 == 0) {
			return (i - 1) / 3;
		} else {
			return i / 3;
		}
	}

	function setImageTime(timestamps, i) {
		modifier = 0.15;
		loop = timestamps[i]["endTime"] - timestamps[i]["startTime"];
		if (loop > 10) {
			return Math.log(loop) * modifier;
		} else {
			return loop * modifier;
		}
	}

	function processImagesTimestamps(image) {
		times = [];
		i = 0;
		matches = image.match(/([^/-]?\d+\.\d)|([\-]\d+[\.]?\d?)|(undefined)/gm);
		for (const match of matches) {
			if (match != "undefined") {
				times.push(Math.abs(parseFloat(match)));
			} else {
				if (i == 0) {
					times.push(0);
					i++;
				} else {
					i--;
					times.push(10);
				}
			}
		}
		return times;
	}

	async function createVideo() {
		console.log("> [video-generator] Creating video");
		images = content.imagesInfo;
		audioPath = content.audioPath;
		var videoOptions = {
			fps: 25,
			loop: 3, // seconds
			transition: true,
			transitionDuration: 1, // seconds
			videoBitrate: 1024,
			videoCodec: "libx264",
			size: "640x?",
			audioBitrate: "128k",
			audioChannels: 2,
			format: "mp4",
			pixelFormat: "yuv420p"
		};

		videoshow(images, videoOptions)
			.audio(audioPath)
			.save("./content/videos/video.mp4")
			.on("start", function(command) {
				console.log("ffmpeg process started:", command);
			})
			.on("error", function(err, stdout, stderr) {
				console.error("Error:", err);
				console.error("ffmpeg stderr:", stderr);
			})
			.on("end", function(output) {
				console.error("Video created in:", output);
			});
	}
}

module.exports = robot;
