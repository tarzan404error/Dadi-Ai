# दादी की कहानियां - Hindi Storytelling App

A fun, safe, screen-light AI-based Hindi storytelling web app for kids that tells personalized audio stories in a warm "Dadi" (grandmother) voice.

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in your project root and add:

\`\`\`
GEMINI_API_KEY=AIzaSyDzG82-a0cnbhsVfOW9KFly81GChbAfKo4
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Run the Development Server
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

### 4. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## Features

- ✅ Personalized Hindi stories with child's name
- ✅ 7 story categories (राजा रानी, परियों, जंगल, etc.)
- ✅ AI-powered story generation using Gemini
- ✅ Text-to-speech in Hindi
- ✅ Screen on/off toggle for reduced screen time
- ✅ Favorites and history tracking
- ✅ Custom story themes
- ✅ Volume controls and audio settings

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **AI**: Google Gemini API via AI SDK
- **Audio**: Web Speech API (Text-to-Speech)
- **Storage**: Local Storage (can be upgraded to Firebase)

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add `GEMINI_API_KEY` in Vercel environment variables
4. Deploy!

### Other Platforms
Make sure to set the `GEMINI_API_KEY` environment variable in your deployment platform.

## API Usage

The app uses Google's Gemini 1.5 Flash model for story generation. Each story generation typically uses:
- ~500-1000 tokens per request
- Stories are 200-350 words each
- Optimized prompts for Hindi content

## Support

For issues or questions, please check:
1. Gemini API key is correctly set
2. Internet connection is stable
3. API quota is not exceeded
