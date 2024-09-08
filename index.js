require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const chokidar = require('chokidar');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const client = new speech.SpeechClient();

// Creates a client
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const request = {
    config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,  // Add this line
        model: 'default'
    },
    interimResults: true, // If you want interim results, set this to true
};

let recognizeStream;
let currentTranscript = '';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('startRecording', () => {
        currentTranscript = '';
        startStreamingTranscription(socket);
    });

    socket.on('stopRecording', () => {
        if (recognizeStream) {
            recognizeStream.destroy();
        }
    });

    socket.on('resetTranscript', () => {
        currentTranscript = '';
        socket.emit('transcription', currentTranscript);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

function startStreamingTranscription(socket) {
    console.log('Recording and transcribing...');

    recognizeStream = client
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', data => {
            const result = data.results[0];
            if (result && result.alternatives[0]) {
                const transcript = result.alternatives[0].transcript;
                if (result.isFinal) {
                    // Capitalize the first letter of the sentence
                    const formattedTranscript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
                    currentTranscript += formattedTranscript + ' ';
                }
                socket.emit('transcription', {
                    interim: transcript,
                    final: currentTranscript.trim()  // Trim any trailing spaces
                });
            }
        });

    recorder
        .record({
            sampleRateHertz: sampleRateHertz,
            threshold: 0,
            verbose: false,
            recordProgram: 'rec',
            silence: '10.0',
        })
        .stream()
        .on('error', console.error)
        .pipe(recognizeStream);
}

if (process.env.NODE_ENV !== 'production') {
    const watcher = chokidar.watch('.', {
        ignored: /node_modules/,
        persistent: true
    });

    watcher.on('change', (path) => {
        console.log(`File ${path} has been changed`);
        io.emit('reload');
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});