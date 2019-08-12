const state = require("./state.js");

async function dragon() {
	const content = state.load();

	console.log(
		"> [timestamps delivery-robot] Getting sentences and images timestamps"
	);

	await getSentencesTimestamp();

	state.save(content);

	async function getSentencesTimestamp() {
		a = 0;
		b = 0;
		c = 0;
		words = [];
		sentences = [];
		await content.detailedTranscription.forEach(word => words.push(word.word));
		await content.sentences.forEach(sentence => sentences.push(sentence.text));

		for await (const word of words) {
			b++;
			if (sentences[a].search(word) == -1) {
				detailedTranscript = content.detailedTranscription[b - 2];
				sentence = content.sentences[a];
				sentence.endSecs = content.detailedTranscription[b - 2].endSecs;
				sentence.startSecs = content.detailedTranscription[b - c - 1].startSecs;
				a++;
				c = 0;
			} else {
				c++;
			}
		}
	}
}

module.exports = dragon;
