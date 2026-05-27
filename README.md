# 💕 Serenity Web Template Reusable - Advanced Love Space Template

A sophisticated, feature-rich web application template designed for couples to create their own romantic digital spaces. Built with cutting-edge React 19, TypeScript, and advanced state management for maximum reusability and customization.

## 🚀 Tech Stack

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0.11-FF6B6B?style=for-the-badge&logo=zustand&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.18-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.97.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.34.2-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## ✨ Advanced Features

### 🎭 Core Experience

- **🔧 Fully Configurable**: Everything customizable through a single `settings.json` file
- **📱 Mobile Responsive**: Optimized for all device sizes with fluid design
- **💝 Romantic Loading Experience**: Animated loading screen with personalized traits
- **🎨 Dynamic Theming**: Advanced color schemes that adapt to your preferences
- **💌 Personalized Content**: Custom greetings, couple names, and relationship milestones
- **🚀 Zero Code Changes**: Customize entirely through configuration

### 🎵 Musical & Creative Features

- **🎼 Lyric Art Poster Generator**: Advanced canvas-based system that transforms song lyrics into ASCII art using image processing
- **🎵 Advanced Music Player**: Spotify-style player with shuffle functionality using Fisher-Yates algorithm and dynamic theming
- **🎶 Smart Playlist Management**: Search, pagination (5 songs per page), and intelligent song filtering
- **✏️ Role-Based Song Editing**: Edit and delete functionality with permission-based access control
- **🔄 Intelligent Shuffling**: Advanced shuffle system that plays all songs regardless of ownership
- **🖼️ ASCII Art Gallery**: Custom ASCII art generation with image processing algorithms
- **🎨 Color Mapping Technology**: Advanced contrast curves and brightness mapping for artistic effects

### 🔐 Advanced Architecture

- **🔒 Authentication System**: Secure user authentication with Supabase integration
- **💾 State Management**: Advanced Zustand stores for settings, themes, and user data
- **🌈 Theme Engine**: Sophisticated theming system with real-time color adaptation
- **📊 Data Visualization**: Chart components with Recharts integration

---

## 🗄️ Database Schema (Supabase)

The Zustand stores in `src/stores/*` are the single reference for the current database schema. Use the tables below as the baseline when setting up or updating Supabase.

### Core Tables

| Table          | Key Columns                                                                                    | Notes                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `love_letters` | `id`, `created_at`, `title`, `message`, `user_id`, `category`, `is_girlfriend`, `attach_image` | Love letters with optional image attachment. `user_id` may be null (admin insert). |
| `songs`        | `id`, `created_at`, `title`, `description`, `is_girlfriend`, `audio_src`                       | Playlist entries; `audio_src` is a storage path or full URL.                       |
| `thoughts`     | `id`, `created_at`, `content`, `is_gf`, `end_date`                                             | Short thoughts with expiration logic.                                              |
| `logs`         | `id`, `created_at`, `is_sad_letter`, `is_miss_letter`, `device`, `address`                     | User activity logs with device and location metadata.                              |

### Memories Tables

| Table               | Key Columns                                        | Notes                                        |
| ------------------- | -------------------------------------------------- | -------------------------------------------- |
| `memories`          | `id`, `created_at`, `date`, `title`, `description` | Core memory records.                         |
| `memory_images`     | `id`, `created_at`, `image_src`, `memories_id`     | Image references; `memories_id` is optional. |
| `memory_milestones` | `id`, `created_at`, `milestone`, `memories_id`     | Milestones linked to a memory.               |
| `memory_mesh`       | `id`, `created_at`, `user_chat`, `ai_chat`         | Long-term AI chat memory store.              |

### Nulla Tables

| Table         | Key Columns                                                                                    | Notes                   |
| ------------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| `nulla`       | `id`, `created_at`, `mode`, `last_eaten`, `eaten_duration`, `last_playing`, `playing_duration` | Tamagotchi-style state. |
| `nulla_foods` | `id`, `created_at`, `count`, `is_unlock`, `price`, `name`                                      | Food inventory.         |
| `nulla_toys`  | `id`, `created_at`, `count`, `is_unlock`, `price`, `name`                                      | Toy inventory.          |

### Tarot Tables

| Table               | Key Columns                                              | Notes                                           |
| ------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| `tarot_cards_decks` | `id`, `created_at`, `is_gf`, `end_date`, `card1`-`card6` | Cards are stored as JSONB with AI descriptions. |

### Storage Buckets

- `songs`: audio files stored by original filename (`songs` bucket)
- `memories`: memory images stored at `memory-images/<filename>` (`memories` bucket)
- `messages`: optional letter images stored under `messages/marde/<filename>`

**First-time setup reminder:** Create the `memories`, `songs`, and `messages` storage buckets in Supabase before running the app so uploads work correctly.

### 🎪 Interactive Components

- **💬 Dialog System**: Beautiful animated dialogs with blur effects and responsive design
- **📱 Mobile-First Navigation**: Advanced responsive navigation with gesture support
- **🎭 Animated Narrator**: Interactive storytelling with animated GIFs and timed messages
- **🎨 Dynamic Widgets**: Reusable widget system for different content types

### 🎵 Advanced Playlist Features

- **🔍 Smart Search**: Real-time song search across titles and descriptions with instant filtering
- **📄 Intelligent Pagination**: Clean 5-songs-per-page layout with responsive navigation controls
- **👥 Role-Based Permissions**: Edit/delete access control based on song ownership (girlfriend's songs only)
- **✏️ Inline Song Editing**: Modal-based editing system for titles and descriptions with form validation
- **🗑️ Secure Delete System**: Confirmation dialogs with loading states and "cannot undo" warnings
- **🔄 Advanced Shuffle Algorithm**: Fisher-Yates shuffle implementation with reshuffle capabilities
- **🎯 Smart Song Filtering**: Intelligent handling of null values in song ownership detection
- **📱 Mobile-Optimized Controls**: Touch-friendly buttons with proper spacing and visual feedback

---

## 🏗️ System Architecture

### Core Philosophy: Configuration-Driven Reusability

The system is built around a **single source of truth** - the `settings.json` file - making it completely reusable without touching any code.

```
┌─────────────────────────────────────────────────────┐
│                   settings.json                     │
│                (Configuration Hub)                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Settings Store (Zustand)               │
│           • Centralized State Management            │
│           • Automatic Validation                    │
│           • Type-Safe Access Methods               │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌─────────────┐    ┌─────────────────┐
│ LoadingView │    │   LandingView   │
│             │    │                 │
│ • Traits    │    │ • Theme Colors  │
│ • Greetings │    │ • Relationship  │
│ • Progress  │    │   Statistics    │
│ • Animation │    │ • Personalized  │
└─────────────┘    │   Messages      │
                   └─────────────────┘
```

### 🎯 Advanced Reusability Strategy

#### 1. **Settings-Driven Architecture**

Every aspect of the application reads from `public/settings.json`:

```json
{
  "themeColor": "#F2A6A6",
  "callsign": "love",
  "couplename": "Jane",
  "appName": "Love Personal Love Space",
  "coupleOfficialDate": "2025-02-16",
  "startingGreetings": "baby girl",
  "traits": [
    "you like pink color",
    "you don't like crowded environment and I find it cute",
    "you have the most beautiful smile that lights up my day"
  ]
}
```

#### 2. **Advanced State Management System**

```typescript
// Settings Store - Single source of truth for all components
interface Settings {
  themeColor: string;
  callsign: string;
  couplename: string;
  appName: string;
  coupleOfficialDate: string;
  startingGreetings: string;
  traits: string[];
}

// Theme Store - Advanced theming capabilities
interface ThemeStore {
  getCurrentThemeColor: () => string;
  initializeTheme: () => Promise<void>;
  waitForInitialization: () => Promise<void>;
}

// Auth Store - User authentication state
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => Promise<void>;
}
```

#### 3. **Comprehensive Component Architecture**

- **LoadingView**: Displays random traits with animated progress and custom GIFs
- **LandingView**: Shows personalized dashboard with relationship stats
- **MadeForYouView**: Interactive gift gallery with artistic features
- **LyricsArtFullscreenView**: Advanced canvas-based lyric art generation
- **AsciiFullscreenView**: ASCII art gallery with image processing
- **AuthView**: Secure authentication interface
- **PlayListView**: Advanced music playlist management with intelligent filtering
- **PlayListWidget**: Individual playlist components with search, pagination, and CRUD operations
- **PlaylistPlayer**: Global music player with shuffle functionality and audio controls
- **Dialog System**: Modular dialog architecture with separate components:
  - **EditSongDialog**: Form-based song editing with validation and Enter key support
  - **DeleteSongDialog**: Confirmation dialogs with loading states and secure deletion
- **Responsive Widget System**: Mobile-first components with adaptive layouts

#### 4. **Advanced Technology Stack**

- **Canvas Processing**: Advanced image-to-ASCII conversion algorithms
- **Color Theory Engine**: Brightness mapping, contrast curves, and color blending
- **Animation System**: Framer Motion integration for smooth transitions
- **Responsive Design**: Clamp() functions and viewport-based scaling
- **State Management**: Advanced Zustand stores with selectors and actions pattern
- **Audio Processing**: HTML5 audio with smart playlist management and shuffle algorithms
- **Database Integration**: Supabase with real-time updates and file storage
- **Form Validation**: Type-safe form handling with async save operations
- **Search & Pagination**: Real-time filtering with optimized pagination controls

---

## 🚀 Quick Setup for New Users

### Step 1: Clone & Install

```bash
git clone https://github.com/centmarde/serenity-web-template-reusable.git
cd serenity-web-template-reusable
npm install
```

### Step 2: Customize Settings

Edit `public/settings.json` with your information:

```json
{
  "themeColor": "#YOUR_COLOR",
  "callsign": "your_nickname",
  "couplename": "Your Partner's Name",
  "appName": "Your Love Space Name",
  "coupleOfficialDate": "YYYY-MM-DD",
  "startingGreetings": "your_pet_name",
  "traits": [
    "trait 1 about your partner",
    "trait 2 about your partner",
    "add as many as you want..."
  ]
}
```

### Step 3: Add Your Loading Animation

Replace `public/assets/loading-gif.gif` with your preferred animation.

### Step 4: Run

```bash
npm run dev
```

**That's it!** Your personalized love space is ready without changing a single line of code.

---

## 🔧 Technical Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Styling**: Inline styles with responsive design
- **Build Tool**: Vite
- **Configuration**: JSON-based settings system

---

## 🎨 Customization Examples

### Theme Colors

```json
{
  "themeColor": "#FF6B9D"  // Pink theme
  "themeColor": "#4ECDC4"  // Teal theme
  "themeColor": "#A8E6CF"  // Mint theme
}
```

### Advanced Configuration Options

#### Traits Categories

```json
{
  "traits": [
    // Appearance traits
    "you have the most beautiful eyes",
    "your smile lights up the room",

    // Personality traits
    "you're incredibly thoughtful",
    "you always make me laugh",

    // Habit traits
    "you love cozy movie nights",
    "you get excited about small things"
  ]
}
```

#### Feature Toggles & Customization

```json
{
  // Core settings (required)
  "themeColor": "#F2A6A6",
  "callsign": "love",
  "couplename": "Jane",

  // Advanced features (optional)
  "enableLyricArt": true,
  "enableAsciiGallery": true,
  "enableMusicPlayer": true,
  "enableAuthSystem": false,

  // Creative customization
  "customLoadingGif": "your-custom-loading.gif",
  "favoriteFlowerImages": ["rose.png", "rose1.png"],
  "musicPlaylist": ["falling.mp3"],

  // AI Integration (optional)
  "enableAiResponses": true,
  "aiPersonality": "romantic"
}
```

#### Technical Canvas Settings

```json
{
  // Lyric Art Configuration
  "lyricsArt": {
    "characterWidth": 5,
    "characterHeight": 9,
    "contrastBoost": true,
    "colorBlendMode": "gradient",
    "backgroundMode": "black"
  },

  // ASCII Art Settings
  "asciiArt": {
    "imageProcessing": "brightness-based",
    "characterSet": "extended",
    "outputResolution": "high"
  }
}
```

---

## 📱 Responsive Design Features

- **Mobile-First Approach**: Optimized for phones, tablets, and desktops
- **Dynamic Scaling**: Uses `clamp()` and `vw` units for fluid typography
- **Touch-Friendly**: Appropriate sizing for mobile interactions
- **Progressive Enhancement**: Works great on all screen sizes

---

## 🔄 System Reusability Benefits

### ✅ **For Developers**

- No code changes needed for customization
- Type-safe configuration system
- Modular component architecture
- Easy to extend with new features

### ✅ **For End Users**

- Simple JSON configuration
- Instant personalization
- No technical knowledge required
- Complete ownership of content

### ✅ **For Deployment**

- Single configuration file to manage
- Easy backup and restore of settings
- Version control friendly
- Environment-specific configurations possible

---

## 📂 Advanced Project Structure

```
future-love-letter/
├── public/
│   ├── settings.json          # 🎯 Main configuration file
│   ├── assets/                # Media assets
│   │   ├── *.gif              # Animated loading GIFs
│   │   └── ascii/             # ASCII art image sets
│   ├── flowers/               # Flower images for widgets
│   └── songs/                 # Audio files for music features
├── src/
│   ├── stores/
│   │   ├── settings.ts        # Main settings store
│   │   ├── theme.ts           # Advanced theming system
│   │   ├── authData.ts        # Authentication state
│   │   └── messagesData.ts    # Message state management
│   ├── pages/
│   │   ├── LoadingView.tsx    # Animated loading experience
│   │   ├── landing/           # Landing page components
│   │   ├── auth/              # Authentication pages
│   │   ├── madeForYou/        # Creative features gallery
│   │   │   ├── MadeForYouView.tsx
│   │   │   ├── LyricsArtFullscreenView.tsx
│   │   │   ├── AsciiFullscreenView.tsx
│   │   │   ├── components/    # Feature-specific components
│   │   │   └── dialogs/       # Interactive modals
│   │   ├── Playlist/          # Advanced music playlist system
│   │   │   ├── PlayListView.tsx         # Main playlist container
│   │   │   ├── components/
│   │   │   │   └── PlayListWidget.tsx   # Individual playlist with search/pagination
│   │   │   └── dialogs/       # Modular dialog system
│   │   │       ├── EditPlaylistDialog.tsx    # Song editing modal
│   │   │       └── DeletePlaylistDialog.tsx  # Delete confirmation modal
│   │   ├── loveLetter/        # Love letter functionality
│   │   └── boyfriendDashboard/ # Partner dashboard
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (50+ components)
│   │   │   ├── lyricsPoster.tsx  # Advanced canvas art generator
│   │   │   ├── ascii-art.tsx     # ASCII processing component
│   │   │   ├── pagination.tsx    # Advanced pagination controls
│   │   │   └── [47+ other UI components]
│   │   ├── PlaylistPlayer.tsx # Global music player with shuffle & audio controls
│   │   ├── Navbar.tsx         # Navigation component
│   │   ├── Waves.tsx          # Animated wave effects
│   │   └── dialogs/           # Reusable dialog components
│   ├── hooks/
│   │   └── use-mobile.ts      # Mobile detection hook
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── supabase.ts        # Database configuration
│   │   ├── Ai.ts              # AI integration
│   │   └── AiSadResponse.ts   # AI emotional responses
│   ├── utils/
│   │   ├── helpers.ts         # Helper functions
│   │   └── routes.ts          # Route definitions
│   └── styles/
│       └── romantic-fonts.css # Custom font definitions
└── README.md                  # This comprehensive guide
```

---

## 🚢 Deployment

The application can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Push to gh-pages branch
- **Any CDN**: Upload built files

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Update settings.json with example data
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎨 Technical Highlights

### Canvas-Based Art Generation

The template features advanced image processing algorithms:

```typescript
// Lyric Art Processing Engine
function renderLyricsPoster(canvas, image, lyrics, themeColor) {
  // 1. Image brightness analysis
  const pixels = context.getImageData(0, 0, width, height).data;

  // 2. Contrast curve application with S-curve
  const boostedBrightness = contrastCurve(brightness);

  // 3. Color mapping from theme to white
  const colorMix = interpolateColor(themeColor, "#FFFFFF", intensity);

  // 4. Character mapping from lyrics stream
  const character = lyricsStream[charIndex % lyricsStream.length];
}
```

### Advanced Responsive Design

```css
/* Fluid typography and spacing */
font-size: clamp(1rem, 4vw, 1.8rem);
width: min(500px, 90vw);
padding: min(30px, 5vw);
margin-bottom: min(40px, 8vw);
```

### State Management Pattern

```typescript
// Type-safe settings access
const { getThemeColor, getCallsign, waitForThemeColor } = useSettingsStore();
const themeColor = await waitForThemeColor(); // Async-safe loading
```

### Advanced Playlist Management System

The template features sophisticated playlist management with modular architecture:

```typescript
// Smart Song Filtering with Null Handling
const getBoyfriendSongs = () => {
  return songs.filter(
    (song) => song.is_girlfriend === false || song.is_girlfriend === null,
  );
};

// Fisher-Yates Shuffle Algorithm
const shuffleArray = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Real-time Search with Pagination
const searchedSongs = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return allFilteredSongs;
  return allFilteredSongs.filter(
    (song) =>
      song.title?.toLowerCase().includes(q) ||
      song.description?.toLowerCase().includes(q),
  );
}, [allFilteredSongs, searchQuery]);

// Role-based CRUD Operations
const canEditSong = (song: Song) => {
  return isGirlfriend && song.is_girlfriend === true;
};
```

### Dialog Architecture Pattern

```typescript
// Modular Dialog System with Separation of Concerns
interface EditSongDialogProps {
  song: Song | null;
  themeColor: string;
  onClose: () => void;
  onSave: (id: number, title: string, description: string) => Promise<void>;
}

interface DeleteSongDialogProps {
  song: Song | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

// Async Form Validation with Loading States
const handleSave = async () => {
  if (!song) return;
  setIsSaving(true);
  await onSave(song.id, editTitle, editDescription);
  setIsSaving(false);
};
```

## 🚀 Advanced Deployment Options

### Environment-Specific Builds

```bash
# Development with hot reload
npm run dev

# Production with optimizations
npm run build

# Preview production build
npm run preview
```

### Platform Deployment

- **Vercel**: `vercel --prod` (Recommended for React apps)
- **Netlify**: Drag and drop `dist/` folder with form handling
- **GitHub Pages**: Push to `gh-pages` branch with Actions
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Docker**: Containerized deployment with nginx

### Performance Optimizations

- **Code Splitting**: Automatic route-based splitting with Vite
- **Image Optimization**: WebP format support and lazy loading
- **Bundle Analysis**: `npm run build --analyzer` to optimize bundle size
- **Service Worker**: Optional PWA capabilities for offline use

## 💝 Perfect For

- **🎭 Creative Couples**: Generate artistic content from your favorite songs and manage personal playlists
- **🎵 Music Lovers**: Advanced playlist management with shuffle algorithms, search, and role-based editing
- **💑 Anniversary Gifts**: Create personalized digital experiences with custom songs and memories
- **🌈 Art Enthusiasts**: Explore canvas-based image processing and ASCII art generation
- **👩‍💻 Developers**: Learn advanced React patterns, Zustand state management, and modular dialog architecture
- **🎨 Designers**: Understand color theory implementation and responsive design patterns
- **📱 Mobile-First Projects**: Study advanced responsive design with clamp() functions and touch-friendly interfaces
- **🚀 Template Builders**: Use as foundation with comprehensive CRUD operations and permissions system
- **🔍 UX Researchers**: Analyze search and pagination patterns with role-based access control
- **🎧 Audio App Developers**: Study HTML5 audio integration with playlist management systems

## 🔮 Upcoming Features

- **🎬 Video Background Processing**: Convert videos to ASCII animations
- **🎯 AI-Powered Art Suggestions**: Machine learning for artistic recommendations
- **�️ Advanced Audio Controls**: Equalizer, volume normalization, and crossfade effects
- **📊 Playlist Analytics**: Play count tracking, favorite song statistics, and listening patterns
- **🔄 Real-time Collaboration**: Live playlist editing with conflict resolution
- **📁 Playlist Categories**: Smart grouping by mood, genre, and occasion
- **🎨 Dynamic Audio Visualizer**: Canvas-based real-time audio visualization
- **�🌍 Internationalization**: Multi-language support for global couples
- **📊 Relationship Analytics**: Data visualization for couple milestones
- **🎪 VR/AR Integration**: Immersive romantic experiences
- **🤖 Advanced AI Chatbot**: Intelligent romantic conversation partner
- **📱 Mobile App**: React Native version for iOS and Android
- **🔄 Real-time Sync**: Live updates across devices

---

**Made with 💕, advanced algorithms, and endless creativity by developers who believe in love and innovative code.**

[![GitHub Stars](https://img.shields.io/github/stars/centmarde/serenity-web-template-reusable?style=social)](https://github.com/centmarde/serenity-web-template-reusable)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
