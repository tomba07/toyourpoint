require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');

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
    },
    interimResults: true, // If you want interim results, set this to true
};

let recognizeStream;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('startRecording', () => {
        startStreamingTranscription(socket);
    });

    socket.on('stopRecording', () => {
        if (recognizeStream) {
            recognizeStream.destroy();
        }
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
            const transcript = data.results[0] && data.results[0].alternatives[0]
                ? data.results[0].alternatives[0].transcript
                : 'Reached transcription time limit';
            socket.emit('transcription', transcript);
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});