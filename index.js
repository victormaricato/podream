const robots = {
	input: require("./robots/input.js"),
	storage: require("./robots/storage.js"),
	transcribing: require("./robots/transcribing.js"),
	text: require("./robots/text.js"),
	timestamp: require("./robots/timestamp.js"),
	searchTerm: require("./robots/searchTerm.js"),
	image: require("./robots/image.js"),
	video: require("./robots/video.js")
};

async function start() {
	robots.input();
	await robots.storage();
	await robots.transcribing();
	await robots.text();
	await robots.timestamp();
	await robots.searchTerm();
	await robots.image();
	await robots.video();
}

start();
