const robots = {
	state: require("./robots/state.js"),
	input: require("./robots/input.js"),
	storage: require("./robots/storage.js"),
	transcribing: require("./robots/transcribing.js"),
	text: require("./robots/text.js"),
	timestamp: require("./robots/timestamp.js"),
	searchTerm: require("./robots/searchTerm.js")
};

async function start() {
	//await robots.input();
	//await robots.storage();
	//await robots.transcribing();
	//await robots.text();
	//await robots.timestamp();
	await robots.searchTerm();
}

start();
