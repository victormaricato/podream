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
	//await acquireImages();
	await setImagesInfo();
	//await createVideo();
	state.save(content);

	async function acquireImages() {
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

		populateImageList();
	}

	async function convertImage(image) {
		return new Promise((resolve, reject) => {
			const inputFile = image.imagesInfo;
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

		content.images = resizedImagesList;
	}

	async function setImagesInfo() {
		images = content.images;
		nextImage = 0;
		imagesTimestamps = [];
		for await (const image of images) {
			nextImage = images.indexOf(image) + 3;
			console.log(nextImage > images.length - 4);
			imagesTimestamps.push({
				startTime: await getImageTimestamps(image)[0],
				endTime: await getImageTimestamps(images[nextImage])[0]
			});
		}
		console.log(imagesTimestamps);
	}

	async function getImageTimestamps(image) {
		console.log(image);
		times = [];
		i = 0;
		matches = image.match(/([^/-]?\d+\.\d)|([\-]\d+[\.]?\d?)|(undefined)/gm);
		matches.forEach(match => {
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
		});
		console.log(times);

		return times;
	}

	async function createVideo() {
		images = content.images;
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
