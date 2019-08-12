const state = require("./state.js");
const language = require("@google-cloud/language");
const sentenceBoundaryDetection = require("sbd");
const client = new language.LanguageServiceClient();

async function dragon() {
	console.log("> [text-analyser] Processing tests");
	const content = state.load();

	await processText();
	await analyseSentences();

	state.save(content);

	async function processText() {
		splittedText = await splitText(content.transcription);
		console.log("> [text-analyser] Splitting sentences");
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
					analysis: []
				});
			});
		}
	}

	async function analyseSentences() {
		console.log("> [text-analyser] Analysing sentences");
		for (const sentence of content.sentences) {
			sentence.analysis = await analyseEntities(sentence);
		}
	}
	async function analyseEntities(sentence) {
		console.log("> [text-analyser] Getting sentence entities");
		entityAnalysis = [];
		document = {
			content: sentence.text,
			type: "PLAIN_TEXT"
		};
		console.log("> [text-analyser] Waiting for Google");
		const [result] = await client.analyzeEntities({ document });
		console.log("> [text-analyser] Got sentence entities");
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

module.exports = dragon;
