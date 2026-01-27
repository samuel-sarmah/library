# LaunchTracker

A real-time space launch tracking application built with React and Vite. Stay updated on upcoming rocket launches from around the world.

![a rocket launches](spacex-OHOU-5UVIYQ-unsplash.jpg)
Photo by <a href="https://unsplash.com/@spacex?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">SpaceX</a> on <a href="https://unsplash.com/photos/gray-spacecraft-taking-off-during-daytime-OHOU-5UVIYQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
      
## Features

- **Real-time Launch Data** - Fetches upcoming launches from The Space Devs API
- **Featured Mission Banner** - Animated highlight for historic missions (Artemis II)
- **Filter by Category** - Filter launches by provider, rocket, or location
- **Sort Options** - Sort by date or name
- **Pagination** - Browse through launches with 10, 20, 30, or 50 results per page
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark Theme** - Space-themed black background design
- **Live Countdown** - Real-time T-minus countdown for each launch

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with responsive breakpoints
- **The Space Devs API** - Launch data source

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:samuel-sarmah/library.git
cd library

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx        # Site header
│   ├── LaunchList.jsx    # Main launch list with pagination
│   ├── LaunchCard.jsx    # Individual launch card
│   ├── SearchBar.jsx     # Filter controls
│   ├── SearchBar.css     # Filter styles
│   └── Countdown.jsx     # T-minus countdown timer
├── styles/
│   └── LaunchList.css    # Main styles
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## API

This app uses [The Space Devs Launch Library 2 API](https://thespacedevs.com/llapi):
- Endpoint: `https://ll.thespacedevs.com/2.2.0/launch/upcoming/`
- Free tier with rate limiting

## License

MIT
