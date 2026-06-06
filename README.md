# Truco Mundial 🏆 (BETA)

**Truco Mundial** is the evolution of Argentine Truco. A game where the wit of Truco meets the passion of World Cup stickers. 
*Note: The project is currently in its Beta phase, undergoing continuous updates, new features, and polish.*

## 🚀 Concept
A fresh take on the classic card game featuring custom-designed stickers of football players (inspired by World Cup albums, but not using real/official stickers). Each player has a power level that respects the traditional hierarchy of Argentine Truco (e.g., Messi is the Ace of Swords, CR7 is the Ace of Clubs, etc.).

The game includes the complete Truco experience, featuring **Truco**, **Retruco**, **Vale Cuatro**, and the full **Envido** system (Envido, Real Envido, Falta Envido). 
**Envido Mechanics:** Unlike traditional Truco (which uses suits and a +20 base bonus), Envido points in Truco Mundial are calculated by summing the envido values of two cards that share the same **Country** or **Club**. The standard +20 base bonus is omitted, making the calculations direct and unique to the players' stats!

## 🎮 Features
- **Real-Time Multiplayer**: Play online with friends using a 4-letter private room code.
- **Host/Guest Architecture**: Robust real-time synchronization with seamless reconnection if a player drops.
- **Local Play**: Play locally against the CPU.
- **Custom Matches**: Choose between short (15 points) or long (30 points) matches.
- **Google Authentication**: Quick and easy login via Supabase for multiplayer access.
- **Bilingual Experience (i18n)**: Full support for both English and Spanish throughout the entire application.
- **Twitch Integration**: Interactive chat overlay and features specifically designed for streamers, engaging audiences directly from the broadcast.
- **World Cup Fixture Integration**: An interactive visual fixture of the 2026 World Cup, showing upcoming games, results, and tying game outcomes to card buffs and power levels.
- **Interactive Card Voting (`/votar`)**: An interactive voting system for the community to rank the best cards. Authenticated users can distribute daily votes to bump up their favorite players' stars.
- **Streamer & Rapper Tournaments**: An elegant dedicated screen showing custom 1vs1 qualifying tournaments hosted by community streamers and rappers.
- **Interactive Roadmap**: A gorgeous vertical timeline detailing upcoming project milestones.
- **Dynamic SPA Routing & SEO**: Zero-dependency URL mapping and client-side history navigation support for `/torneos`, `/votar`, `/ruta`, and `/fixture` paths with real-time dynamic SEO title and Open Graph metadata updates.

## 🛠️ Tech Stack
- **Frontend**: React + Vite (TypeScript)
- **Package Manager**: Yarn
- **Styling**: Vanilla CSS + Framer Motion (for premium animations and responsive design)
- **State Management**: Zustand
- **Backend/DB**: Supabase (Realtime, Postgres & Auth)
- **Code Quality**: Husky + Commitlint (Conventional Commits)

## 🎨 Look & Feel
- **Urban Freestyle** Aesthetics: Bold typography, high contrast, and vibrant colors.
- Inspired by the **2026 World Cup Album**.
- **Football stadium** style digital scoreboard.
- Optimized for both mobile and desktop screens with a premium interface.

## 🤝 Contribution and License
This project is developed openly (Open development — collaboration inquiries welcome).
The source code is available for review and learning, but **the concept, design, and brand of "Truco Mundial" are protected and reserved.** If you are interested in collaborating, have ideas for the game, or wish to use part of this code in other projects, please get in touch via GitHub.