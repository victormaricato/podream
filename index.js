const robots = {
	input: require("./robots/input.js"),
	state: require("./robots/state.js"),
	transcribing: require("./robots/transcribing.js")
};

async function start() {
	robots.input();
	robots.transcribing();
}

start();
