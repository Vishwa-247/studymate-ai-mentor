
# StudyMate AI Learning Platform

## Environment Setup

This application requires the following environment variables to be set:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the API key and paste it into your `.env` file as `VITE_GEMINI_API_KEY`

## Running the Application

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory and add the environment variables as described above
4. Start the application: `npm run dev`

## Features

- AI-powered course generation
- Interactive flashcards
- Quiz system
- Mock interview preparation
- Real-time progress tracking

## Troubleshooting

### API Authentication Issues

If you see a 403 error related to the Gemini API:
1. Check that your `VITE_GEMINI_API_KEY` is correctly set in the `.env` file
2. Make sure your API key is valid and has not expired
3. Verify that you have enabled the Generative Language API in your Google Cloud Console
