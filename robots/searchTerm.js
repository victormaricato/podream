const state = require("./state.js");

async function robot() {
	const content = state.load();
	console.log("> [search-term analyser] Getting sentences search terms");
	getRelevantEntities();

	state.save(content);

	async function getRelevantEntities() {
		for (const sentence of content.sentences) {
			populateKeywords(sentence);
			chooseEntity(sentence);
		}
	}

	async function populateKeywords(sentence) {
		console.log("> [search-term analyser] Filtering keywords");
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
		console.log("> [search-term analyser] Choosing sentence search term");
		amountOfKeywords = sentence.keywords.length;
		currentSentenceIndex = content.sentences.indexOf(sentence);
		previousIndex = currentSentenceIndex - 2;

		for (const keyword of sentence.keywords) {
			if (
				sentence.searchTerm.length > 0 &&
				sentence.searchTerm.indexOf(" ") == -1
			) {
				sentence.searchTerm = sentence.searchTerm + " " + keyword.name;
			} else {
				if (amountOfKeywords > 0) {
					if (
						/^[A-Z]/.test(keyword.name[0]) &
						(keyword.type != "ORGANIZATION")
					) {
						amountOfKeywords = 0;
						sentence.searchTerm = keyword.name;
					} else if (amountOfKeywords > 1) {
						sentence.searchTerm =
							sentence.keywords[0].name + " " + sentence.keywords[1].name;
					}
				}
			}
		}

		if (sentence.searchTerm.indexOf(" ") == -1) {
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
				try {
					if (sentence.analysis.length > 1) {
						sentence.searchTerm =
							sentence.analysis[0].name + " " + sentence.analysis[1].name;
					} else if (sentence.analysis.length > 0) {
						if (content.sentences[previousIndex].keywords.length > 0) {
							sentence.searchTerm =
								sentence.analysis[0].name +
								" " +
								content.sentences[previousIndex].keywords[0].name;
						} else {
							sentence.searchTerm =
								content.sentences[previousIndex].keywords[0].name +
								" " +
								content.sentences[currentSentenceIndex + 1].keywords[0].name;
						}
					} else {
						if (
							content.sentences[previousIndex].keywords.length > 0 &&
							content.sentences[currentSentenceIndex + 1].keywords.length > 0
						) {
							sentence.searchTerm =
								content.sentences[previousIndex].keywords[0].name +
								" " +
								content.sentences[currentSentenceIndex + 1].keywords[0].name;
						} else if (
							content.sentences[previousIndex].analysis.length > 0 &&
							content.sentences[currentSentenceIndex + 1].analysis.length > 0
						) {
							sentence.searchTerm =
								content.sentences[previousIndex].analysis[0].name +
								" " +
								content.sentences[currentSentenceIndex + 1].analysis[0].name;
						}
					}
				} catch {
					sentence.searchTerm = "audio";
				}
			}
		}
	}
}

module.exports = robot;
