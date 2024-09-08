# ToYourPoint

ToYourPoint is a real-time speech-to-text transcription tool that leverages Google Cloud Speech-to-Text API for accurate and efficient transcription.

## Features

- Real-time audio recording and streaming
- Continuous transcription using Google Cloud Speech-to-Text API
- Easy-to-use command-line interface

## Prerequisites

Before you begin, ensure you have the following requirements:

- Node.js (v14 or later) installed on your system
- A Google Cloud project with Speech-to-Text API enabled
- Google Cloud credentials (service account key)
- Sox (Sound eXchange) audio processing tool

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/toyourpoint.git
   cd toyourpoint
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Install Sox:
   - On macOS (using Homebrew):
     ```
     brew install sox
     ```
   - On Linux (Ubuntu/Debian):
     ```
     sudo apt-get install sox
     ```
   - On Windows:
     Download and install from the [Sox website](http://sox.sourceforge.net/)

4. Set up Google Cloud credentials:
   - Create a service account and download the JSON key file
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your JSON key file:
     ```
     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/keyfile.json"
     ```

## Usage

To start the transcription process:

1. Run the following command:
   ```
   node index.js
   ```

2. Speak into your microphone. The tool will transcribe your speech in real-time.

3. Press `Ctrl+C` to stop the recording and finish the transcription.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Google Cloud for the Speech-to-Text API
- Sox for audio processing capabilities
