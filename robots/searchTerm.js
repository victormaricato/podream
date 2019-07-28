const state = require("./state.js");

/*
FOR EACH SENTENCE:
    GET A ENTITY -- WORK ON WHICH ENTITY 
    GET IMAGE
        SENTENCE.imageURL = imageURL
    DOWNLOAD IMAGE
    SAVE IMAGE IN content/images/ dir
    IMAGE NAME = TIMESTAMP-ENTITY.png
*/

async function robot() {
	const content = state.load();

	getRelevantEntities();

	state.save(content);

	async function getRelevantEntities() {
		for (const sentence of content.sentences) {
			populateKeywords(sentence);
			chooseEntity(sentence);
		}
	}

	async function populateKeywords(sentence) {
		if (sentence.keywords.length > 0) {
			sentence.keywords = [];
			sentence.searchTerm = "";
		}
		for (const entity of sentence.analysis) {
			if (
				(entity.type != "OTHER" && entity.type != "NUMBER") ||
				/^[A-Z]/.test(entity.name[0])
			) {
				sentence.keywords.push(entity);
			}
		}
	}

	async function chooseEntity(sentence) {
		amountOfKeywords = sentence.keywords.length;
		for (const keyword of sentence.keywords) {
			amountOfKeywords--;
			if (sentence.searchTerm.length > 0 && !/\s/.test(sentence.searchTerm)) {
				sentence.searchTerm = sentence.searchTerm + " " + keyword.name;
			} else {
				if (amountOfKeywords > 0) {
					if (/^[A-Z]/.test(keyword.name[0])) {
						sentence.searchTerm = keyword.name;
					}
				} else {
					sentence.searchTerm = sentence.keywords[0].name;
				}
			}
		}
	}
}

module.exports = robot;
