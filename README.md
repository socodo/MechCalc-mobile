# MechCalc Client

Mobile app hỗ trợ tính toán và thiết kế hệ dẫn động cơ khí.

## Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Routing**: Expo Router v6
- **Styling**: NativeWind v4 (Tailwind CSS)
- **State Management**: Zustand (planned)
- **Language**: TypeScript

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── explore.tsx    # Explore screen
│   │   └── _layout.tsx    # Tab layout
│   ├── modal.tsx          # Modal screen
│   └── _layout.tsx        # Root layout
├── components/
│   ├── common/            # Shared components (ThemedText, ThemedView, etc.)
│   └── ui/                # UI primitives (Collapsible, IconSymbol, etc.)
├── constants/             # Theme colors, fonts
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (cn, helpers)
├── services/              # API calls, external services
├── stores/                # Zustand stores
├── types/                 # TypeScript type definitions
└── assets/                # Images, fonts
```

## Features (Planned)

### Module 1: Motor Selection
- Input: Force (F), Velocity (v), equivalent load
- Output: Required power (P), RPM (n), motor code suggestions

### Module 2: Chain Drive Calculation
- Geometric and kinematic parameters
- Cross-validation with gear module
- Design loop with auto-suggestions

### Module 3: Gear Drive Calculation
- Support for straight and helical gears (Strategy Pattern)
- Cross-validation with chain module
- Intermediate variable traceability

### Database
- Digitized lookup tables from textbooks
- Motor parameters, tolerances, bearings, keys, load coefficients

## Design Patterns

- **Strategy Pattern**: Swappable calculation formulas (straight vs helical gears)
- **Observer Pattern**: Auto-update dependent modules when inputs change
- **Facade Pattern**: Simplified interface for complex calculation logic
- **Singleton Pattern**: Single database connection throughout app lifecycle

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run on web browser |
| `npm run lint` | Run ESLint |

## Path Aliases

Use `@/` to import from `src/`:

```typescript
import { ThemedText } from '@/components/common/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/cn';
```

## Tailwind Colors

Colors are defined in `tailwind.config.js` with CSS variables for dark mode support:

```typescript
// Usage with className
<View className="bg-background text-foreground" />
<Text className="text-primary" />
```

Available semantic colors:
- `background` / `foreground`
- `primary` / `primary-foreground`
- `muted` / `muted-foreground`
- `icon` / `icon-muted`

## Team

- **M1 (Tech Lead)**: Architecture, Database, Design Patterns, Code Review
- **M2 (UI/UX)**: Interface Design, Motor Module
- **M3 (Logic Dev)**: Chain Drive Module, Lookup Tables
- **M4 (Logic Dev)**: Gear Drive Module, Cross-validation Algorithm
