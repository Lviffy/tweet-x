# Tweet-X

An AI-powered tweet generator and Twitter profile analyzer that helps you create engaging, professional tweets with customizable parameters.

## 🚀 Features

### Tweet Generation
- **AI-Powered Content Creation**: Uses Google's Gemini AI to generate high-quality tweets
- **Multiple Formats**: Generate single tweets or multi-tweet threads (3-10 tweets)
- **Customizable Tone**: Choose from various writing styles and voices
- **Length Control**: Short (80-150 chars), Medium (150-220 chars), or Long (220-280 chars)
- **Content Options**:
  - Optional hashtags (2-3 relevant tags)
  - Strategic emoji placement
  - Call-to-action integration
- **Batch Generation**: Create 1-10 tweets or thread variations at once

### User Experience
- **Real-time Generation**: Live tweet creation with progress feedback
- **Copy to Clipboard**: One-click copying for easy sharing
- **Session Management**: Save and retrieve tweet generation sessions
- **Responsive Design**: Works seamlessly across devices
- **Authentication**: Secure user authentication via Supabase

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Shadcn/ui** for UI components

### Backend
- **Supabase** for database and authentication
- **Deno** runtime for edge functions
- **Google Gemini AI** for content generation
- **RESTful API** architecture

### Deployment
- **Supabase Edge Functions** for serverless backend
- **PostgreSQL** database
- **CORS-enabled** API endpoints

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Google Gemini AI API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lviffy/tweet-x.git
   cd tweet-x
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Supabase Edge Function**
   Set the Gemini API key in your Supabase project:
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Deploy Supabase functions**
   ```bash
   supabase functions deploy generate-tweets
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 🚀 Usage

### Basic Tweet Generation

1. **Enter Your Topic**: Describe what you want to tweet about
2. **Select Tone**: Choose from professional, casual, humorous, etc.
3. **Choose Format**: Single tweets or thread variations
4. **Set Parameters**:
   - Number of tweets (1-10)
   - Length preference
   - Include hashtags, emojis, or CTAs
5. **Generate**: Click generate and get AI-created content
6. **Copy & Share**: Use the copy button to share on Twitter

### API Usage

The tweet generation endpoint accepts POST requests:

```typescript
interface TweetGenerationRequest {
  topic: string;           // Required: Tweet topic
  tone: string;            // Required: Writing tone
  format: string;          // 'single' or 'thread-3', 'thread-5', etc.
  tweetCount: number;      // 1-10 tweets
  length: string;          // 'short', 'medium', 'long'
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}
```

## 📁 Project Structure

```
tweet-x/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── supabase/
│   └── functions/
│       └── generate-tweets/  # AI tweet generation logic
├── public/                # Static assets
└── package.json
```

## 🔐 Authentication

Tweet-X uses Supabase authentication with support for:
- Email/password authentication
- Session management
- Protected routes
- User-specific tweet history

## 🎯 Tweet Generation Logic

The AI generation process:

1. **Prompt Engineering**: Creates detailed prompts based on user parameters
2. **AI Processing**: Sends requests to Google Gemini AI
3. **Content Parsing**: Extracts and formats tweets from AI response
4. **Validation**: Ensures tweets meet Twitter's character limits
5. **Response**: Returns structured tweet objects

## 🔧 Configuration

### Tone Options
- Professional
- Casual
- Humorous
- Educational
- Inspirational
- And more...

### Format Types
- **Single**: Individual standalone tweets
- **Thread-3**: 3-tweet threads
- **Thread-5**: 5-tweet threads
- **Thread-10**: 10-tweet threads

### Length Guidelines
- **Short**: 80-150 characters (punchy, impactful)
- **Medium**: 150-220 characters (detailed but engaging)
- **Long**: 220-280 characters (comprehensive information)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for content generation
- Supabase for backend infrastructure
- Shadcn/ui for beautiful UI components
- The React and TypeScript communities

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Tweet-X** - Making Twitter content creation effortless with AI ✨
