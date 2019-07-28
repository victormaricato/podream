const state = require("./state.js");

const { google } = require("googleapis");
const customsearch = google.customsearch("v1");

const googleSearchAPIKey = require("../credentials/gcp-credentials.json");
/*
FOR EACH SENTENCE:
    GET IMAGE
        SENTENCE.imageURL = imageURL
    DOWNLOAD IMAGE
    SAVE IMAGE IN content/images/ dir
    IMAGE NAME = TIMESTAMP-ENTITY.png
*/

async function robot() {
	const content = state.load();

	await searchImagesBySentences();
	await sentencesImagesURL();

	state.save(content);

	async function searchImagesBySentences() {
		for (const sentence of content.sentences) {
			sentence.imageURL = await executeSearch(sentence);
		}
	}

	async function executeSearch(sentence) {
		const res = await customsearch.cse.list({
			cx: googleSearchAPIKey.search_engine_id,
			q: sentence.searchTerm,
			auth: googleSearchAPIKey.api_key,
			searchType: "image",
			imgSize: "huge",
			imgType: "news",
			num: 1
		});
		return res.data.items[0].link;
	}

	async function sentencesImagesURL() {}
}

module.exports = robot;
