let mediaRecorder;
let audioChunks = [];
let isRecording = false;
const recordBtn = document.getElementById('recordBtn');
const loadingDiv = document.getElementById('loading');
const audioElement = document.getElementById('response');
const spinnerElement = document.getElementById('spinner');
const apiUrl = 'https://yj9m5q3cpf.execute-api.us-east-1.amazonaws.com/prod/kid-assistant/v1/answer';

function toggleRecording() {
	if (isRecording) {
		audioElement.classList.add('hidden');
		stopRecording();
	} else {
		loadingDiv.classList.add('hidden');
		startRecording();
	}
}

function startRecording() {
	const mediaStreamConstraints = { audio: true };
	navigator.mediaDevices
		.getUserMedia(mediaStreamConstraints)
		.then((stream) => {
			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};
			mediaRecorder.onstop = sendAudio;
			mediaRecorder.start();

			isRecording = true;
			recordBtn.textContent = 'Stop Recording';
		})
		.catch((err) => {
			console.error('Error while trying to record: ', err);
		});
}

function stopRecording() {
	mediaRecorder.stop();
	isRecording = false;
	recordBtn.textContent = 'Start Recording';
	loadingDiv.classList.add('hidden');
	spinnerElement.classList.remove('hidden');
}

function sendAudio() {
	const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
	const formData = new FormData();
	formData.append('audio', audioBlob);

	fetch(apiUrl, {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'audio/wav', // Ensure this matches what your backend expects
		},
		body: audioBlob,
	})
		.then((response) => response.text()) // Get the body as plain text (base64 string)
		.then((base64String) => {
			const audioBytes = atob(base64String); // Decode the base64

			const audioArray = new Uint8Array(audioBytes.length);
			for (let i = 0; i < audioBytes.length; i++) {
				audioArray[i] = audioBytes.charCodeAt(i);
			}

			const audioBlob = new Blob([audioArray], { type: 'audio/mp3' }); // Create a Blob from the array of bytes
			const audioUrl = URL.createObjectURL(audioBlob);
			audioElement.src = audioUrl;
			audioElement.addEventListener('canplay', () => {
				spinnerElement.classList.add('hidden');
				audioElement.classList.remove('hidden');
				audioElement.play();
			});
		})
		.catch((error) => {
			spinnerElement.classList.add('hidden');
			console.error('Error sending/receiving audio: ', error);
		});
}
