process.env["GOOGLE_APPLICATION_CREDENTIALS"] =
	"credentials/gcp-credentials.json";

const speech = require("@google-cloud/speech").v1p1beta1;

// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");
// Creates a client
const storage = new Storage();

const fs = require("fs");

const state = require("./state.js");

async function transcribe() {
	const content = state.load();

	const client = new speech.SpeechClient();
	const audioPath = state.load().audioPath;
	const fileName = state.load().fileName;

	const gcsUri = await uploadAudio(audioPath, fileName);

	const apiRequest = getRequestInfo(gcsUri);

	const [transcription, detailedTranscript] = await requestTranscription(
		apiRequest
	);

	content.transcription = transcription;
	content.detailedTranscription = detailedTranscript;

	state.save(content);

	async function requestTranscription(request) {
		const [operation] = await client.longRunningRecognize(request);
		const [response] = await operation.promise();

		response.results.forEach(result => {
			transcript = result.alternatives[0].transcript;
			detailedTranscription = processResult(result);
		});
		return [transcript, detailedTranscription];
	}

	async function uploadAudio(audioPath, fileName) {
		const bucketName = "podream-audios";

		// Uploads a local file to the bucket
		await storage.bucket(bucketName).upload(audioPath);
		fileUri = `gs://${bucketName}/${fileName}`;
		return fileUri;
	}

	function getRequestInfo(gcsUri) {
		const audio = {
			uri: gcsUri
		};
		const config = {
			encoding: "LINEAR16",
			sampleRateHertz: 16000,
			languageCode: "pt-BR",
			enableAutomaticPunctuation: true,
			enableWordTimeOffsets: true,
			enableWordConfidence: true,
			enableSpeakerDiarization: true
		};
		const request = {
			audio: audio,
			config: config
		};
		return request;
	}

	function processResult(result) {
		detailedResult = [];
		result.alternatives[0].words.forEach(wordInfo => {
			const startSecs =
				`${wordInfo.startTime.seconds}` +
				`.` +
				wordInfo.startTime.nanos / 100000000;
			const endSecs =
				`${wordInfo.endTime.seconds}` +
				`.` +
				wordInfo.endTime.nanos / 100000000;
			detailedResult.push({
				startSecs: parseFloat(startSecs),
				endSecs: parseFloat(endSecs),
				word: wordInfo.word,
				confidence: wordInfo.confidence,
				speakerTag: wordInfo.speakerTag
			});
		});
		return detailedResult;
	}
}

module.exports = transcribe;
