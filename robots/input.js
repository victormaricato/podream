const readline = require("readline-sync");
const state = require("./state.js");
const fs = require("fs");

function robot() {
	const content = {};

	content.fileName = askFileName();
	content.audioPath = getAudioPath(content.fileName);
	state.save(content);

	function askFileName() {
		return readline.question(
			'Type the .WAV filename (it should be placed on "./content/audios"): '
		);
	}

	function getAudioPath(fileName) {
		return checkFile("./content/audios/" + fileName);
	}

	function checkFile(path) {
		format = path.slice(-3);
		if (fs.existsSync(path) && format == "wav") {
			return path;
		} else if (format != "wav") {
			console.error("File is not .wav");
		} else {
			console.error("File does not exists");
		}
	}
}

module.exports = robot;
