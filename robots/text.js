const state = require("./state.js");

function robot() {
	const content = state.load();
	console.log(content.transcription);
}

module.exports = robot;
