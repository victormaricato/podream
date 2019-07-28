const robots = {
	input: require("./robots/input.js"),
	state: require("./robots/state.js"),
	transcribing: require("./robots/transcribing.js"),
	text: require("./robots/text.js"),
	timestamp: require("./robots/timestamp.js")
};

async function start() {
	await robots.input();
	await robots.transcribing();
	await robots.text();
	await robots.timestamp();
}

start();
