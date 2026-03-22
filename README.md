# Sotehus PWA

Swedish Electricity Spot Price & Power Monitoring Dashboard - A Progressive Web Application.

## Features

- ✅ **Real-time Data** - Displays spot price, grid consumption, solar production, and grid frequency
- ✅ **Auto Refresh** - Updates every second from the backend API
- ✅ **Offline Support** - Service Worker caches assets for offline use
- ✅ **Installable** - Can be added to home screen on mobile and desktop
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Dark Mode** - Automatic dark mode based on system preference
- ✅ **Cost Reports** - View energy costs for last hour, last 24 hours, or last calendar month
- ✅ **Price Period Blocks** - Detailed breakdown of cost per price period with spot price, consumption, and cost
- ✅ **Solar Production Benefit** - Cost view shows energy sold to grid and cost reduction from solar production
- ✅ **Settings** - Edit backend parameters (VAT, energy tax, transfer price, etc.) directly from the app
- ✅ **Navigation Menu** - Hamburger menu for accessing cost reports and settings
- ✅ **Dynamic Title** - Header title fetched from backend `location_name` parameter
- ✅ **Version Display** - Footer shows both frontend and backend versions
- ✅ **Force Refresh** - Menu option to clear all caches and reload from server

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- Or Python 3 for quick development

### Running with Docker (Recommended)

```bash
# Build and run
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app will be available at `http://localhost:8000`

### Running for Development

```bash
cd src
python3 -m http.server 8000
```

The app will be available at `http://localhost:8000`

## Configuration

Edit `src/js/app.js` to configure the backend API URL:

```javascript
const CONFIG = {
  API_BASE_URL: 'http://sotehus-pi5:8080/api',
  REFRESH_INTERVAL: 1000, // 1 second
  VERSION: '1.5.0'
};
```

## Project Structure

```
sotehus-pwa/
├── src/
│   ├── index.html        # Main HTML file
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service Worker
│   ├── css/
│   │   └── styles.css    # Styles
│   ├── js/
│   │   └── app.js        # Main JavaScript
│   └── icons/            # PWA icons
├── doc/
│   ├── openapi.json      # Backend OpenAPI spec
│   └── cost_plan.md      # Implementation plan
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
├── nginx.conf            # Nginx configuration
└── README.md
```

## Adding Icons

For your PWA to work properly, you need to add icon files to `src/icons/`. Required sizes:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- icon-16x16.png (favicon)
- icon-32x32.png (favicon)

You can generate these from a single 512x512 PNG using:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

## Release Log

### v1.5.0
- Added "Force refresh" menu item that clears all service worker caches, unregisters the service worker, and reloads the page — ensuring the latest version is fetched from the server. Especially useful for iOS Safari home screen PWAs where cache updates can be unreliable.

### v1.4.0
- Display both frontend and backend versions in the footer (e.g. `FE v1.4.0 | BE v1.6.0`)
- Header title dynamically fetched from backend `location_name` parameter
- Cost view: replaced "Cost before VAT" and "VAT" rows with "Energy sold to grid" and "Cost reduction" using values from the backend API
- Settings: input field and save button now displayed on the same line for a more compact layout

### v1.3.0
- Cost reports for last hour, last 24 hours, and last calendar month
- Price period blocks with detailed cost breakdown
- Settings view for editing backend parameters
- Navigation menu

## Testing PWA Features

### Install Prompt
The install button appears when the browser detects the app is installable. On Chrome, you can also use the address bar install icon.

### Offline Mode
1. Open the app in Chrome
2. Open DevTools (F12)
3. Go to Network tab
4. Check "Offline"
5. Refresh the page - the app should still work

### Service Worker
View the Service Worker status in Chrome DevTools:
- Application > Service Workers

## Customization

### Theme Colors
Edit the CSS variables in `src/css/styles.css`:

```css
:root {
  --primary-color: #4a90d9;
  --primary-dark: #357abd;
  /* ... other colors */
}
```

### Manifest
Edit `src/manifest.json` to customize:
- App name and description
- Theme and background colors
- Start URL
- Display mode
- Icons

## API

The PWA connects to the sotehus-backend API at `http://sotehus-pi5:8080/api`. Full API documentation is available at `/swagger/doc.json` and saved in `doc/openapi.json`.

### Endpoints Used

| Endpoint | Method | Description |
|---|---|---|
| `/api/data` | GET | Real-time dashboard data (price, grid, solar, frequency) |
| `/api/energy/cost?start=...&stop=...` | GET | Energy cost for a time period with price period blocks |
| `/api/params` | GET | List all configurable parameters |
| `/api/params/{key}` | PUT | Update a parameter value |

### `/api/data` Response

```json
{
  "grid": {
    "valid": true,
    "power": 245.5,
    "lastUpdate": "2025-12-25T10:30:00+01:00"
  },
  "price": {
    "valid": true,
    "price": 1.20,
    "lastUpdate": "2025-12-25T10:15:00+01:00"
  },
  "solar": {
    "valid": true,
    "power": 2.5,
    "lastUpdate": "2025-12-25T10:00:00+01:00"
  },
  "frequency": {
    "valid": true,
    "frequency": 50.02,
    "lastUpdate": "2025-12-25T10:30:00+01:00"
  }
}
```

### `/api/energy/cost` Response

```json
{
  "cost": 12.34,
  "costBeforeVat": 9.87,
  "vat": 2.47,
  "kwh": 5.67,
  "blocks": [
    {
      "start": "2026-03-17T10:00:00+01:00",
      "stop": "2026-03-17T11:00:00+01:00",
      "spotPrice": 0.45,
      "kwh": 1.2,
      "cost": 2.10
    }
  ]
}
```

### `/api/params` Response

```json
[
  {
    "id": "...",
    "key": "VAT",
    "description": "VAT percent",
    "content": "{\"value\": 25}",
    "changed": "2026-03-17T17:02:17+01:00"
  }
]
```

## License

MIT
