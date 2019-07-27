const speech = require("@google-cloud/speech").v1p1beta1;
const fs = require("fs");

const state = require("./state.js");

async function transcribe() {
	const content = state.load();

	const client = new speech.SpeechClient();
	const audioPath = state.load().audioPath;

	const processedAudio = processAudio(audioPath);

	const apiRequest = getRequestInfo(processedAudio);

	const [transcription, detailed_transcription] = await requestTranscription(
		apiRequest
	);

	content.transcription = transcription;
	content.detailed_transcription = detailed_transcription;

	state.save(content);

	async function requestTranscription(request) {
		const [operation] = await client.longRunningRecognize(request);
		const [response] = await operation.promise();

		response.results.forEach(result => {
			transcript = result.alternatives[0].transcript;
			detailed_result = processResult(result);
		});
		return [transcript, detailed_result];
	}

	function processAudio(audioPath) {
		return fs.readFileSync(audioPath).toString("base64");
	}

	function getRequestInfo(processedAudio) {
		const audio = {
			content: processedAudio
		};
		const config = {
			encoding: "OGG_OPUS",
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
		detailed_result = [];
		result.alternatives[0].words.forEach(wordInfo => {
			const startSecs =
				`${wordInfo.startTime.seconds}` +
				`.` +
				wordInfo.startTime.nanos / 100000000;
			const endSecs =
				`${wordInfo.endTime.seconds}` +
				`.` +
				wordInfo.endTime.nanos / 100000000;
			detailed_result.push({
				startSecs: parseFloat(startSecs),
				endSecs: parseFloat(endSecs),
				word: wordInfo.word,
				confidence: wordInfo.confidence,
				speakerTag: wordInfo.speakerTag
			});
		});
		return detailed_result;
	}
}

module.exports = transcribe;
