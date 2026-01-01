# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adminite is an open-source Electron desktop application for Salesforce developers and administrators. It provides a SOQL/SOSL query editor with context-aware autocompletion and advanced query capabilities.

**Tech Stack:** TypeScript, React 17, Electron 18, TanStack Query, Zustand, Ant Design

## Common Commands

```bash
# Development
yarn dev                    # Start Electron app in development mode
yarn compile                # Clean build (removes dist/, runs electron-webpack)

# Testing
yarn test                   # Run all Jest tests
yarn test:single 'testname' # Run specific test file by name
yarn snapshot:update        # Update Jest snapshots

# Formatting
yarn prettify               # Format code with Prettier

# Build & Release
yarn dist:mac               # Build for macOS
yarn dist:windows           # Build for Windows
yarn release                # Release for both platforms with auto-updater
```

## Environment Setup

Create a `.env` file with Salesforce Connected App credentials:

```
ELECTRON_WEBPACK_APP_SALESFORCE_CLIENT_ID=your_client_id
ELECTRON_WEBPACK_APP_SALESFORCE_CLIENT_SECRET=your_client_secret
```

## Architecture

### Process Structure (Electron)

- **Main Process** (`src/main/`): Handles OAuth authentication flow via jsforce, spawns local Express server for OAuth callback, manages auto-updates via electron-updater, IPC communication with renderer
- **Renderer Process** (`src/renderer/`): React application with Zustand for state management and TanStack Query for server state

### State Management (`src/renderer/store/`)

- **Zustand** - Client-side state management with simple stores
- **TanStack Query** - Server state, caching, and async data fetching for Salesforce API calls

Key stores:

- `connection` - Active Salesforce org connection
- `connections` - All stored org connections
- `queries` - SOQL query content per tab
- `queryResults` - Query result data
- `queryTabs` - Tab management
- `sobject` - SObject schema data (has dual context: QUERY and RESULT)
- `feature` - Current active feature (soql, permissions, schema)

### Feature Modules (`src/renderer/applications/`)

Each feature is a self-contained module:

- `soql/` - Main SOQL query editor with autocomplete, results table, cell renderers
- `fieldLevelSecurity/` - FLS viewer
- `schemaExplorer/` - Schema exploration tool
- `orgSelector/` - Connection management

### Key Patterns

1. **TanStack Query** for server state - async operations, caching, and data fetching
2. **Zustand** for client state - simple, lightweight stores for UI state
3. **Feature-based code organization** - each feature has its own components in its folder
4. **Lazy loading** - features loaded via React.lazy() for code splitting
5. **SOQL parsing** - uses `soql-parser-js` library for query parsing and autocompletion context

### Important Utilities

- `src/renderer/utils/queryBuilder.ts` - SOQL query construction helpers
- `src/renderer/utils/queryResultsHandler.ts` - Processing and transforming query results
- `src/helpers/local-store.ts` - LocalStorage management for persisting connections

## Testing

Tests use Jest with jsdom environment. The `jest.setup.js` configures matchMedia mock required for Ant Design components. Test files are colocated with source files using `.test.ts`/`.test.tsx` extensions.

### ESLint/Prettier

Ensure that changes do not introduce ESLint warnings or errors.

Formatting should also follow prettier styles.

### Library/API documentation

IMPORTANT - ALWAYS use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means YOU MUST automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.
