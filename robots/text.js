const state = require("./state.js");
const language = require("@google-cloud/language");
const sentenceBoundaryDetection = require("sbd");
const client = new language.LanguageServiceClient();

async function robot() {
	const content = state.load();

	await processText();
	await analyseSentences();

	state.save(content);

	async function processText() {
		splittedText = await splitText(content.transcription);
		await getSentences(splittedText);

		function splitText(text) {
			return text.split("\n").join(" ");
		}

		async function getSentences(text) {
			content.sentences = [];
			const sentences = await sentenceBoundaryDetection.sentences(text);
			sentences.forEach(async sentence => {
				await content.sentences.push({
					text: sentence,
					keywords: [],
					images: [],
					analysis: []
				});
			});
		}
	}

	async function analyseSentences() {
		for (const sentence of content.sentences) {
			sentence.analysis = await analyseEntities(sentence);
		}
	}
	async function analyseEntities(sentence) {
		entityAnalysis = [];
		document = {
			content: sentence.text,
			type: "PLAIN_TEXT"
		};
		const [result] = await client.analyzeEntities({ document });

		const entities = result.entities;

		entities.forEach(entity =>
			entityAnalysis.push({
				name: entity.name,
				salience: entity.salience,
				type: entity.type
			})
		);
		return entityAnalysis;
	}
}

module.exports = robot;
