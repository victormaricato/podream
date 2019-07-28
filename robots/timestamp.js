const state = require("./state.js");

async function robot() {
	const content = state.load();

	await getSentencesTimestamp();
	state.save(content);

	async function getSentencesTimestamp() {
		a = 0;
		b = 0;
		words = [];
		sentences = [];
		await content.detailedTranscription.forEach(word => words.push(word.word));
		await content.sentences.forEach(sentence => sentences.push(sentence.text));

		for (const word of words) {
			b++;
			if (sentences[a].search(word) == -1) {
				endSecs = content.detailedTranscription[b - 2].endSecs;
				sentence = content.sentences[a];
				sentence.endSecs = endSecs;
				a++;
			}
		}
	}
}

module.exports = robot;