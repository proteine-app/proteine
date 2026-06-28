# Protein Tracker

A modern, lightweight web application for tracking daily protein intake. No sign-ups, no accounts, no data collection—just simple, private protein tracking.

## Features

- **Daily Protein Tracking**: Log foods and track your daily protein consumption
- **Smart Progress Visualization**: Color-coded progress bar (red → orange → yellow → green) showing progress toward your daily target
- **Personalized Daily Target**: Set your body weight, automatically calculates your protein target (1g per kg)
- **Food Search & Caching**: Search food items with intelligent caching to speed up repeated lookups
- **Adjustable Portions**: Edit food quantities on the fly and see real-time protein calculations
- **Session Management**: Track weight and daily intake—data persists across page refreshes but resets daily
- **Privacy-First**: All data is stored locally in your browser using localStorage; nothing is sent to servers
- **Mobile-Responsive**: Optimized for desktop, tablet, and mobile devices
- **Zero Dependencies**: Built with Vue 3 and Vite for minimal bundle size and maximum performance

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd proteine

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

## Usage

1. **Set Your Weight**: Enter your body weight in kilograms. Your daily protein target is calculated as 1g per kg of body weight.

2. **Search Foods**: Use the food search to find items by name. Foods are cached to speed up future lookups.

3. **Add Foods**: Select a food from search results and specify the quantity in grams. The app calculates the protein content automatically.

4. **Monitor Progress**: Watch your daily progress in real-time with the color-coded progress bar:
   - 🔴 Red: Less than 60% of target
   - 🟠 Orange: 60–80% of target
   - 🟡 Yellow: 80–100% of target
   - 🟢 Green: 100% or more of target

5. **Edit or Delete**: Adjust quantities or remove foods as needed from the daily log.

6. **Reset Day**: Clear all foods for the day while keeping your weight setting (accessible via "Reset Day" button).

## Technical Details

### Architecture

The application is built with a **component-based** architecture using Vue 3:

- **Components** (`src/components/`):
  - `DailyTracker.vue`: Displays weight input, daily stats, progress bar, and reset controls
  - `FoodSearch.vue`: Allows searching and selecting foods
  - `FoodEntry.vue`: Form for specifying food quantity and protein content
  - `DailyLog.vue`: Lists added foods with edit and delete capabilities

- **Services** (`src/services/`):
  - `storage.js`: Manages localStorage for daily data and food cache
  - `calculator.js`: Handles all protein calculations (totals, targets, progress colors)
  - `api.js`: Food database API service for searching food nutritional data

### Data Storage

All data is stored in **localStorage** under two namespaces:
- `proteine_daily`: Weight and daily foods (resets at midnight if needed)
- `proteine_cache`: Cached food search results (up to 100 entries with LRU eviction)

No server-side data storage—everything stays on the user's device.

### Build Tools

- **Vite**: Fast build tool and dev server
- **Vue 3**: Modern reactive component framework
- **Vitest**: Unit testing framework
- **Happy DOM**: Lightweight DOM environment for testing

## API Reference

### Storage Service

#### `getDailyData()`
Get the complete daily data (weight + foods).

```javascript
const { weight, foods } = getDailyData()
```

#### `setWeight(kg)`
Set the user's body weight in kilograms.

```javascript
setWeight(75)
```

#### `addFood(food)`
Add a food item to today's foods.

```javascript
const food = addFood({ name: 'Chicken', grams: 100, proteinPer100g: 31 })
```

#### `updateFood(id, updates)`
Update a food item by ID (e.g., change quantity).

```javascript
updateFood(foodId, { grams: 150 })
```

#### `removeFood(id)`
Delete a food item from today's log.

```javascript
removeFood(foodId)
```

#### `clearDayFoods()`
Clear all foods for the day (weight persists).

```javascript
clearDayFoods()
```

#### `getCachedFood(name)`
Retrieve a cached food by name.

```javascript
const cached = getCachedFood('Chicken')
```

#### `setCachedFood(name, data)`
Cache a food with its protein value.

```javascript
setCachedFood('Chicken', { proteinPer100g: 31 })
```

### Calculator Service

#### `calculateProtein(grams, proteinPer100g)`
Calculate protein amount from grams and protein per 100g.

```javascript
const protein = calculateProtein(100, 31) // 31g
```

#### `calculateTarget(bodyweightKg)`
Calculate daily protein target (1g per kg of body weight).

```javascript
const target = calculateTarget(75) // 75g
```

#### `calculateTotalProtein(foods)`
Calculate total protein from an array of food items.

```javascript
const total = calculateTotalProtein(foods)
```

#### `getProgressColor(consumed, target)`
Get progress color based on consumption percentage.

```javascript
const color = getProgressColor(50, 75) // 'orange'
```

## Development

### Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm test           # Run tests
npm run test:ui    # Run tests with interactive UI
```

### Testing

Tests are located in the `tests/` directory and use Vitest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

### Code Style

The project follows Vue 3 best practices:
- Single-file components (`.vue`)
- Composition API and Options API
- Scoped styles to prevent CSS conflicts
- JSDoc comments for public APIs

## Browser Support

Works in all modern browsers that support:
- ES2020 JavaScript
- localStorage API
- CSS Grid and Flexbox

## License

ISC

## Contributing

To contribute:

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Test your changes with `npm test`
4. Submit a pull request with a description of your changes

For detailed development setup, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## Troubleshooting

### Data Not Persisting?
- Check that localStorage is enabled in your browser
- Clear browser cache if you experience issues with old data
- Open browser DevTools → Application → localStorage to inspect stored data

### Food Search Not Working?
- Verify your internet connection (API calls may require network access)
- Check browser console for API errors
- Refresh the page and try again

### Performance Issues?
- Clear the food cache by resetting your browser's localStorage for this site
- Close other browser tabs
- Update to the latest version of your browser

## Support

For issues or feature requests, please open an issue on the project repository.
