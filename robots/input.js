const readline = require("readline-sync");
const state = require("./state.js");
const fs = require("fs");

function robot() {
	const content = {};

	content.audioPath = askAudioPath();
	console.log(content.audioPath);
	state.save(content);

	function askAudioPath() {
		return checkFileExists(
			"./content/audios/" +
				readline.question(
					'Type the audio filename (it should be placed on "./content/audios"): '
				)
		);
	}

	function checkFileExists(path) {
		if (fs.existsSync(path)) {
			return path;
		} else {
			console.error("File does not exists");
		}
	}
}

module.exports = robot;
