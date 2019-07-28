process.env["GOOGLE_APPLICATION_CREDENTIALS"] =
	"credentials/gcp-credentials.json";

const speech = require("@google-cloud/speech").v1p1beta1;
const client = new speech.SpeechClient();

const state = require("./state.js");

async function transcribe() {
	const content = state.load();

	await requestTranscription();

	state.save(content);

	async function requestTranscription() {
		const [operation] = await client.longRunningRecognize(getRequestInfo());
		const [response] = await operation.promise();

		response.results.forEach(result => {
			detailedTranscription = processDetailedResult(result);
		});

		const transcript = response.results
			.map(result => result.alternatives[0].transcript)
			.join("\n");

		content.transcription = transcript;
		content.detailedTranscription = detailedTranscription;
	}

	function getRequestInfo() {
		const audio = {
			uri: content.gcsUri
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

	function processDetailedResult(result) {
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
