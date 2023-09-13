let mediaRecorder;
let audioChunks = [];
let isRecording = false;
const recordBtn = document.getElementById('recordBtn');
const loadingDiv = document.getElementById('loading');
const audioElement = document.getElementById('response');
const spinnerElement = document.getElementById('spinner');
const errorMessageDiv = document.getElementById('errorMessage');
const micElement = document.getElementById('micIconContainer');
const apiUrl = 'https://yj9m5q3cpf.execute-api.us-east-1.amazonaws.com/prod/kid-assistant/v1/answer';

// ... [Resto del código]

// Al cargar la página, inicializamos la configuración desde el localStorage
window.addEventListener('DOMContentLoaded', () => {
	const storedLanguage = localStorage.getItem('selectedLanguage');
	const storedApiToken = localStorage.getItem('apiToken');
	const isDarkMode = localStorage.getItem('darkMode') === 'true';

	if (isDarkMode) {
		document.getElementById('darkModeToggle').checked = true;
		enableDarkMode(storedLanguage);
	} else {
		disableDarkMode(storedLanguage);
	}

	if (storedLanguage) {
		document.getElementById('language').value = storedLanguage;
		changeLanguage();
	}

	if (storedApiToken) {
		document.getElementById('apiToken').value = storedApiToken;
	}
});

function changeLanguage() {
	const languageSelector = document.getElementById('language');
	const selectedLanguage = languageSelector.value;

	// Guardar la selección del idioma en el localStorage
	localStorage.setItem('selectedLanguage', selectedLanguage);

	// Cambia el idioma de la página según la selección del usuario
	if (selectedLanguage === 'es') {
		// Cambia el texto y los contenidos al español
		document.title = 'KidAssistant - Respondiendo Preguntas de Niños';
		document.querySelector('h1').textContent = 'Bienvenido a KidAssistant';
		document.querySelector('p').textContent = '¡Un lugar divertido donde los niños pueden obtener respuestas a sus preguntas!';
		document.querySelector('label[for="apiToken"]').textContent = 'Token de la API:';
		document.querySelector('#apiToken').placeholder = 'Ingresa tu token de la API'; // Línea agregada
		document.querySelector('#recordBtn').textContent = 'Comenzar Grabación';
	} else {
		// Cambia el texto y los contenidos al inglés
		document.title = "KidAssistant - Answering Kids' Questions";
		document.querySelector('h1').textContent = 'Welcome to KidAssistant';
		document.querySelector('p').textContent = 'A fun place where kids can get their questions answered!';
		document.querySelector('label[for="apiToken"]').textContent = 'API Token:';
		document.querySelector('#apiToken').placeholder = 'Enter your API token'; // Línea agregada
		document.querySelector('#recordBtn').textContent = 'Start Recording';
	}
}

// Guardar el token de la API en el localStorage cuando el input cambie
document.getElementById('apiToken').addEventListener('input', (event) => {
	localStorage.setItem('apiToken', event.target.value);
});

// ... [Resto del código]

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
	errorMessageDiv.classList.add('hidden');
	audioChunks = [];
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
			const languageSelector = document.getElementById('language');
			const selectedLanguage = languageSelector.value;

			if (selectedLanguage == 'es') {
				recordBtn.textContent = 'Detener Grabación';
			} else {
				recordBtn.textContent = 'Stop Recording';
			}
			recordBtn.style.backgroundColor = '#ff4b5c';
			micElement.classList.remove('hidden');
		})
		.catch((err) => {
			console.error('Error while trying to record: ', err);
		});
}

function stopRecording() {
	mediaRecorder.stop();
	isRecording = false;

	const languageSelector = document.getElementById('language');
	const selectedLanguage = languageSelector.value;

	if (selectedLanguage == 'es') {
		recordBtn.textContent = 'Comenzar Grabación';
	} else {
		recordBtn.textContent = 'Start Recording';
	}

	loadingDiv.classList.add('hidden');
	spinnerElement.classList.remove('hidden');

	recordBtn.style.backgroundColor = '#4a90e2'; /* Restablece el color del botón */
	micElement.classList.add('hidden');
}

function sendAudio() {
	const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
	const formData = new FormData();
	formData.append('audio', audioBlob);

	const apiToken = document.getElementById('apiToken').value;

	recordBtn.classList.add('hidden');

	fetch(apiUrl, {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'audio/wav', // Ensure this matches what your backend expects
			'api-token': apiToken,
		},
		body: audioBlob,
	})
		.then((response) => {
			recordBtn.classList.remove('hidden');
			if (!response.ok) {
				return response.json().then((data) => {
					const errorMsg = data.error || 'Network response was not ok'; // Si data.error no existe, usamos un mensaje genérico.
					throw new Error(errorMsg);
				});
			}
			return response.text();
		})
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
				errorMessageDiv.classList.add('hidden');
				audioElement.classList.remove('hidden');
				if (!isSafari()) {
					audioElement.play();
				}
			});
		})
		.catch((error) => {
			spinnerElement.classList.add('hidden');
			errorMessageDiv.textContent = 'Error: ' + error.message;
			errorMessageDiv.classList.remove('hidden');
			recordBtn.classList.remove('hidden');
			console.error('Error sending/receiving audio: ', error);
		});
}

function isSafari() {
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function toggleDarkMode() {
	const storedLanguage = localStorage.getItem('selectedLanguage');
	const isDarkMode = localStorage.getItem('darkMode') === 'true';

	if (isDarkMode) {
		disableDarkMode(storedLanguage);
		localStorage.setItem('darkMode', 'false');
	} else {
		enableDarkMode(storedLanguage);
		localStorage.setItem('darkMode', 'true');
	}
}

function enableDarkMode(language) {
	document.body.classList.add('dark-mode'); // Suponiendo que 'dark-mode' es la clase que activa el modo oscuro
	if (language === 'en') {
		document.getElementById('darkModeToggle').innerText = 'Light Mode';
	} else {
		document.getElementById('darkModeToggle').innerText = 'Modo Claro';
	}
}

function disableDarkMode(language) {
	document.body.classList.remove('dark-mode');
	if (language === 'en') {
		document.getElementById('darkModeToggle').innerText = 'Dark Mode';
	} else {
		document.getElementById('darkModeToggle').innerText = 'Modo Oscuro';
	}
}
