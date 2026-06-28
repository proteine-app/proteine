# Development Guide

This guide covers everything you need to know about developing, testing, and deploying the Protein Tracker application.

## Table of Contents

1. [Setup](#setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Testing](#testing)
5. [Build & Deployment](#build--deployment)
6. [Debugging](#debugging)
7. [Code Standards](#code-standards)
8. [Contributing](#contributing)

## Setup

### Prerequisites

- **Node.js**: v16 or higher ([Download](https://nodejs.org/))
- **npm**: Included with Node.js
- **Git**: For version control

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd proteine

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Environment Setup

No environment variables are required for development. The application uses localStorage for all data persistence.

## Project Structure

```
proteine/
├── src/
│   ├── components/              # Vue single-file components
│   │   ├── DailyTracker.vue     # Weight input & daily stats
│   │   ├── FoodSearch.vue       # Food search interface
│   │   ├── FoodEntry.vue        # Food quantity form
│   │   └── DailyLog.vue         # Display & manage foods
│   ├── services/                # Business logic services
│   │   ├── storage.js           # localStorage management
│   │   ├── calculator.js        # Protein calculations
│   │   └── api.js               # Food database API
│   ├── styles/                  # Global styles
│   ├── main.js                  # Application entry point
│   └── App.vue                  # Root component
├── tests/
│   ├── components/              # Component tests
│   ├── services/                # Service tests
│   └── setup.js                 # Test configuration
├── index.html                   # HTML entry point
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest configuration
├── package.json                # Dependencies & scripts
└── README.md                   # User documentation
```

### Key Files Explained

#### `src/main.js`
Application entry point. Mounts the Vue 3 app to the DOM.

#### `src/App.vue`
Root component managing app-level state and orchestrating child components.

#### `src/services/storage.js`
Centralized localStorage management with CRUD operations for daily data and food cache.

#### `src/services/calculator.js`
Pure utility functions for all protein calculations and progress logic.

#### `src/services/api.js`
External API integration for food database lookups.

#### `vite.config.js`
Vite build configuration and development server setup.

#### `vitest.config.js`
Test runner configuration with Vue 3 support.

## Development Workflow

### Starting Development

```bash
npm run dev
```

- Opens dev server at `http://localhost:3000`
- Hot Module Replacement (HMR) enabled—changes auto-refresh
- Source maps available for debugging in DevTools

### Code Organization

#### Components
- Use **Single-File Components** (`.vue` files)
- Include template, script, and scoped styles
- Keep components focused and composable
- Use `data()`, `props`, `methods`, `computed`, and `emits`

Example:
```vue
<template>
  <div class="component">
    <!-- Template here -->
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  props: {
    // Define props
  },
  emits: ['event-name'],
  data() {
    return {
      // Component state
    }
  },
  computed: {
    // Computed properties
  },
  methods: {
    // Component methods
  },
}
</script>

<style scoped>
/* Scoped styles */
</style>
```

#### Services
- Export pure functions for reusability
- Add JSDoc comments for all public functions
- Separate concerns: storage, calculations, API calls
- No side effects in utility functions

Example:
```javascript
/**
 * Calculate protein from grams and protein per 100g
 * @param {number} grams - amount in grams
 * @param {number} proteinPer100g - protein content per 100g
 * @returns {number} protein in grams
 */
export function calculateProtein(grams, proteinPer100g) {
  return (grams * proteinPer100g) / 100
}
```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the relevant files

3. **Test your changes** (see [Testing](#testing))

4. **Commit with clear messages**:
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   ```

5. **Push to remote**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a pull request** on GitHub

### Commit Message Convention

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Test additions/modifications
- `chore:` Maintenance tasks
- `style:` Formatting changes

Example:
```
feat: add food quantity editing in daily log

Allows users to modify the amount of food in grams
and see real-time protein recalculation.
```

## Testing

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Run specific test file
npm test -- tests/services/calculator.test.js

# Run with coverage
npm test -- --coverage
```

### Test Structure

Tests should be located in the `tests/` directory, mirroring the `src/` structure:

```
tests/
├── components/
│   ├── DailyTracker.test.js
│   ├── FoodSearch.test.js
│   └── ...
├── services/
│   ├── storage.test.js
│   ├── calculator.test.js
│   └── ...
└── setup.js
```

### Writing Tests

Use Vitest with Vue Test Utils for component testing:

#### Service Tests
```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { calculateProtein, calculateTarget } from '../../src/services/calculator'

describe('Calculator Service', () => {
  describe('calculateProtein', () => {
    it('should calculate protein correctly', () => {
      const result = calculateProtein(100, 31)
      expect(result).toBe(31)
    })
  })

  describe('calculateTarget', () => {
    it('should calculate target as 1g per kg', () => {
      const result = calculateTarget(75)
      expect(result).toBe(75)
    })
  })
})
```

#### Component Tests
```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyTracker from '../../src/components/DailyTracker.vue'

describe('DailyTracker Component', () => {
  it('renders correctly', () => {
    const wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('emits weight-changed event', async () => {
    const wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })
    const input = wrapper.find('input[type="number"]')
    await input.setValue(75)
    expect(wrapper.emitted('weight-changed')).toBeTruthy()
  })
})
```

### Test Best Practices

- Write tests that verify behavior, not implementation
- Keep tests focused and independent
- Use descriptive test names
- Avoid testing external APIs (mock them)
- Aim for >80% code coverage on critical paths
- Use `beforeEach` and `afterEach` for setup/cleanup

### Testing localStorage

```javascript
import { beforeEach, afterEach, vi } from 'vitest'

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear()
})

afterEach(() => {
  // Clean up after each test
  localStorage.clear()
})
```

## Build & Deployment

### Development Build

```bash
npm run dev
```
- Unbundled for fast HMR
- Source maps enabled
- Unminified code

### Production Build

```bash
npm run build
```

This:
- Bundles and minifies code
- Generates optimized assets
- Creates `dist/` directory with production files
- Removes source maps

### Preview Production Build

```bash
npm run preview
```
- Serves the production build locally
- Useful for testing before deployment

### Deployment Options

#### Static Hosting (Recommended)
The application is static and can be deployed to:
- **Netlify**: Connect GitHub repo → auto-deploys on push
- **Vercel**: Similar to Netlify, Vue 3 optimized
- **GitHub Pages**: Add build workflow, deploy from `dist/`
- **AWS S3 + CloudFront**: Manual upload + CDN
- **Any static hosting service**: Upload `dist/` folder

#### Example Netlify Deployment
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

#### GitHub Pages Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

## Debugging

### Browser DevTools

1. **Open DevTools**: `F12` or `Ctrl+Shift+I`
2. **Console Tab**: View logs and errors
3. **Elements Tab**: Inspect DOM structure
4. **Application Tab**: Inspect localStorage
5. **Network Tab**: Monitor API calls
6. **Sources Tab**: Set breakpoints and step through code

### Debugging localStorage

```javascript
// In browser console:
localStorage.getItem('proteine_daily')
localStorage.getItem('proteine_cache')
JSON.parse(localStorage.getItem('proteine_daily'))
```

### Vue DevTools

Install the [Vue DevTools Browser Extension](https://devtools.vuejs.org/):
- Inspect component hierarchy
- View reactive data and props
- Track emitted events
- Time-travel debugging

### Common Issues

#### Issue: Changes not appearing in browser
- Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
- Check dev server is running: `npm run dev`
- Check for console errors

#### Issue: localStorage errors
- Check browser localStorage is enabled
- Clear old data: `localStorage.clear()`
- Verify data format in DevTools

#### Issue: Tests failing
- Clear node_modules: `rm -rf node_modules && npm install`
- Check test file paths match src structure
- Verify import statements are correct

## Code Standards

### JavaScript Style

- Use **ES6+ modern JavaScript**
- Use `const` and `let` (avoid `var`)
- Use template literals for strings
- Use arrow functions where appropriate
- Add JSDoc comments for public functions

### Vue Best Practices

- Use Single-File Components (`.vue`)
- Keep components focused and reusable
- Use props for parent-to-child communication
- Use emits for child-to-parent events
- Use scoped styles to prevent CSS conflicts
- Use semantic HTML

### CSS Standards

- Use CSS Grid and Flexbox for layouts
- Use CSS variables for colors and spacing
- Keep breakpoints consistent
- Mobile-first responsive design
- Use meaningful class names (BEM-inspired)

### File Naming

- **Components**: PascalCase (e.g., `DailyTracker.vue`)
- **Services/Utils**: camelCase (e.g., `calculator.js`)
- **Tests**: filename.test.js

### Linting & Formatting

While not enforced by default, consider setting up:
- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for git hooks

```bash
npm install -D eslint prettier husky @vue/eslint-config-prettier
```

## Contributing

### Development Workflow

1. **Fork** or create a feature branch
2. **Implement** your changes
3. **Test** thoroughly with `npm test`
4. **Build** for production with `npm run build`
5. **Commit** with clear messages
6. **Push** to remote
7. **Create pull request** with description

### Pull Request Checklist

- [ ] Changes are tested
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Code follows style guidelines
- [ ] Commit messages are clear
- [ ] New functions have JSDoc comments
- [ ] No console errors or warnings

### Code Review

PRs will be reviewed for:
- Functionality and correctness
- Code quality and style
- Test coverage
- Documentation
- Performance impact

## Performance Tips

- Keep components small and focused
- Use `computed` properties for derived state
- Lazy-load components if needed
- Minimize localStorage operations
- Use production build for performance testing

## Security Considerations

- All data stored locally—no server communication
- No sensitive data in localStorage (it's accessible via browser DevTools)
- Input validation on all user inputs
- Cross-site scripting (XSS) safe with Vue's template escaping
- No external script dependencies (all via npm)

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)

## Getting Help

- Check existing GitHub issues
- Read the [README.md](./README.md) for user documentation
- Review code comments and JSDoc strings
- Open a new issue with detailed description
