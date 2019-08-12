const dragons = {
	input: require("./dragons/input.js"),
	storage: require("./dragons/storage.js"),
	transcribing: require("./dragons/transcribing.js"),
	text: require("./dragons/text.js"),
	timestamp: require("./dragons/timestamp.js"),
	searchTerm: require("./dragons/searchTerm.js"),
	image: require("./dragons/image.js"),
	video: require("./dragons/video.js")
};

async function start() {
	dragons.input();
	await dragons.storage();
	await dragons.transcribing();
	await dragons.text();
	await dragons.timestamp();
	await dragons.searchTerm();
	await dragons.image();
	await dragons.video();
}

start();
