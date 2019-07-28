const state = require("./state.js");

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
		sentence.keywords = [];
		sentence.searchTerm = "";

		for (const entity of sentence.analysis) {
			if (
				(entity.type != "OTHER" && entity.type != "NUMBER") ||
				/^[A-Z]/.test(entity.name[0])
			) {
				sentence.keywords.push(entity);
			}
		}
	}

	function chooseEntity(sentence) {
		amountOfKeywords = sentence.keywords.length;
		currentSentenceIndex = content.sentences.indexOf(sentence);
		previousIndex = currentSentenceIndex--;

		for (const keyword of sentence.keywords) {
			if (sentence.searchTerm.length > 0 && !/\s/.test(sentence.searchTerm)) {
				sentence.searchTerm = sentence.searchTerm + " " + keyword.name;
				amountOfKeywords = 0;
			} else if (
				sentence.searchTerm.length > 0 &&
				/\s/.test(sentence.searchTerm)
			) {
				sentence.searchTerm = sentence.searchTerm;
			} else {
				if (amountOfKeywords > 0) {
					if (
						/^[A-Z]/.test(keyword.name[0]) &
						(keyword.type != "ORGANIZATION")
					) {
						sentence.searchTerm = keyword.name;
					}
				}
			}
			amountOfKeywords--;
		}

		if (!/\s/.test(sentence.searchTerm)) {
			if (sentence.searchTerm.length > 0) {
				if (sentence.keywords.length > 1) {
					sentence.searchTerm =
						sentence.searchTerm + " " + sentence.keywords[0].name;
				} else {
					sentence.searchTerm =
						sentence.searchTerm +
						" " +
						content.sentences[previousIndex].keywords[0].name;
				}
			} else {
				if (sentence.analysis.length > 1) {
					sentence.searchTerm =
						sentence.analysis[0].name + " " + sentence.analysis[1].name;
				} else if (sentence.analysis.length > 0) {
					if (content.sentences[previousIndex].keywords.length > 0) {
						sentence.searchTerm =
							sentence.analysis[0].name +
							content.sentences[previousIndex].keywords[0].name;
					} else {
						sentence.searchTerm =
							content.sentences[previousIndex - 2].keywords[0].name +
							" " +
							content.sentences[currentSentenceIndex + 2].keywords[0].name;
					}
				} else {
					if (
						content.sentences[previousIndex - 2].keywords.length > 0 &&
						content.sentences[currentSentenceIndex + 2].keywords.length > 0
					) {
						sentence.searchTerm =
							content.sentences[previousIndex - 2].keywords[0].name +
							" " +
							content.sentences[currentSentenceIndex + 2].keywords[0].name;
					} else if (
						content.sentences[previousIndex - 2].analysis.length > 0 &&
						content.sentences[currentSentenceIndex + 2].analysis.length > 0
					) {
						sentence.searchTerm =
							content.sentences[previousIndex - 2].analysis[0].name +
							" " +
							content.sentences[currentSentenceIndex + 2].analysis[0].name;
					}
					try {
						sentence.searchTerm =
							content.sentences[previousIndex - 2].searchTerm +
							" " +
							content.sentences[currentSentenceIndex + 2].searchTerm;
					} catch {
						sentence.searchTerm = "audio";
					}
				}
			}
		}
	}
}

module.exports = robot;
