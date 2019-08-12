const state = require("./state.js");

const { google } = require("googleapis");
const customsearch = google.customsearch("v1");

const googleSearchAPIKey = require("../credentials/gcp-credentials.json");

const imageDownloader = require("node-image-downloader");

async function dragon() {
	let content = state.load();

	content.sentences = await searchImagesBySentences();

	await downloadAndSaveImages(content);

	state.save(content);

	async function searchImagesBySentences() {
		console.log("> [images-generator] Searching images");
		sentences = content.sentences;

		for await (const sentence of sentences) {
			results = await executeSearch(sentence);
			sentence.imageURLs = await results;
		}
		console.log(
			"> [images-generator] Got images... \n> [images-generator] Downloading images!"
		);

		return await sentences;
	}

	async function executeSearch(sentence) {
		const res = await customsearch.cse.list({
			cx: googleSearchAPIKey.search_engine_id,
			q: sentence.searchTerm,
			num: 3,
			filter: 1,
			auth: googleSearchAPIKey.api_key,
			searchType: "image",
			imgSize: "huge",
			imgType: "news"
		});
		return await getImagesUrls(res);
	}

	async function getImagesUrls(res) {
		if (res.data.items !== undefined) {
			imagesUrls = [];
			for await (const item of res.data.items) {
				await imagesUrls.push(item.link);
			}
			return await imagesUrls;
		}
	}

	async function downloadAndSaveImages(content) {
		content.downloadedImages = [];

		for (const sentence of content.sentences) {
			const startSecs = sentence.startSecs;
			const endSecs = sentence.endSecs;
			i = 0;

			for (const imgURL of sentence.imageURLs) {
				try {
					if (content.downloadedImages.includes(imgURL)) {
						throw new Error("Image already downloaded");
					}
					i++;
					await downloadAndSave(imgURL, `${startSecs}-${endSecs}(${i})-raw`);
					content.downloadedImages.push(imgURL);
				} catch (error) {
					console.log(error);
				}
			}
		}
		console.log("> [images-generator] Images downloaded");
	}
	async function downloadAndSave(url, fileName) {
		return imageDownloader({
			imgs: [{ uri: url, filename: `${fileName}` }],
			dest: "./content/images/"
		});
	}
}

module.exports = dragon;
