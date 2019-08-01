const state = require("./state.js");

const { google } = require("googleapis");
const customsearch = google.customsearch("v1");

const googleSearchAPIKey = require("../credentials/gcp-credentials.json");

const imageDownloader = require("image-downloader");

async function robot() {
	const content = state.load();

	console.log("> [images-generator] Searching images");
	await searchImagesBySentences();
	console.log("> [images-generator] Got images... \nDownloading images!");
	await downloadAndSaveImages();
	console.log("> [images-generator] Images downloaded");

	state.save(content);

	async function searchImagesBySentences() {
		for (const sentence of content.sentences) {
			results = await executeSearch(sentence);
			sentence.imageURLs = results;
		}
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
			for (const item of res.data.items) {
				imagesUrls.push(item.link);
			}
			return imagesUrls;
		}
	}

	async function downloadAndSaveImages() {
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
					await downloadAndSave(
						imgURL,
						`${startSecs}-${endSecs}(${i})-raw.png`
					);
					content.downloadedImages.push(imgURL);
				} catch (error) {
					console.log(error);
				}
			}
		}
	}
	async function downloadAndSave(url, fileName) {
		return imageDownloader.image({
			url: url,
			dest: `./content/images/${fileName}`
		});
	}
}

module.exports = robot;
