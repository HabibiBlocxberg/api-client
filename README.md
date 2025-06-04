# @wot/api-client

Eine geteilte HTTP-Client-Bibliothek für alle WorldOfTextcraft-Projekte.

## Installation

```bash
# Lokal installieren (entwicklung)
cd shared-libs/wot-api-client
yarn build
cd ../../frontend  # oder backend/admin
yarn add file:../shared-libs/wot-api-client

# Oder über privates NPM-Registry (produktion)
yarn add @wot/api-client
```

## Verwendung

```typescript
import { ApiClient, ApiMethods } from '@wot/api-client';

// Client initialisieren
const apiClient = new ApiClient({
  baseUrl: 'http://api.wot.local',
  timeout: 5000,
  defaultHeaders: {
    'X-API-Version': '1.0'
  }
});

// GET-Request
const users = await apiClient.get<User[]>('/users');

// POST-Request
const newUser = await apiClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Mit benutzerdefinierten Headers
const data = await apiClient.get<Data>('/protected', {
  headers: {
    'Authorization': 'Bearer token123'
  }
});

// Mit Timeout
const data = await apiClient.post<Data>('/slow-endpoint', payload, {
  timeout: 30000
});
```

## Features

- ✅ TypeScript-Support
- ✅ Automatische JSON-Serialisierung/Deserialisierung
- ✅ Konfigurierbare Timeouts
- ✅ Bessere Fehlerbehandlung
- ✅ Anpassbare Headers
- ✅ AbortController-Support
- ✅ Credentials-Support für Cross-Origin-Requests

## API

### ApiClient

#### Constructor
```typescript
new ApiClient(config?: ApiClientConfig)
```

#### Methoden
- `get<T>(url: string, config?: RequestConfig): Promise<T>`
- `post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>`
- `put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>`
- `patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>`
- `delete<T>(url: string, config?: RequestConfig): Promise<T>`
- `setBaseUrl(url: string): void`
- `getBaseUrl(): string`

### Interfaces

```typescript
interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  baseUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

## Migration von der alten Api.ts

```typescript
// Vorher
import api from './utilities/Api';
const data = await api.get('/users');

// Nachher  
import { ApiClient } from '@wot/api-client';
const apiClient = new ApiClient({ baseUrl: 'http://api.wot.local' });
const data = await apiClient.get('/users');
```

## Entwicklung

```bash
# Abhängigkeiten installieren
yarn install

# Build
yarn build

# Entwicklungsmodus (watch)
yarn dev

# Tests ausführen
yarn test

# Linting
yarn lint
```

## Publishing

```bash
# Version erhöhen
yarn version patch  # oder minor/major

# Build und publish
yarn build
yarn publish
``` 