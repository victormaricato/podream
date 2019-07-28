const robots = {
	input: require("./robots/input.js"),
	state: require("./robots/state.js"),
	transcribing: require("./robots/transcribing.js"),
	text: require("./robots/text.js")
};

async function start() {
	//robots.input();
	//await robots.transcribing();
	robots.text();
}

start();
