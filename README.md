# Sotehus PWA

Swedish Electricity Spot Price & Power Monitoring Dashboard - A Progressive Web Application.

## Features

- ✅ **Real-time Data** - Displays spot price, grid consumption, and solar production
- ✅ **Auto Refresh** - Updates every 3 seconds from the backend API
- ✅ **Offline Support** - Service Worker caches assets for offline use
- ✅ **Installable** - Can be added to home screen on mobile and desktop
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Dark Mode** - Automatic dark mode based on system preference

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
  REFRESH_INTERVAL: 3000, // 3 seconds
  VERSION: '1.0.0'
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

The PWA connects to the sotehus-backend API endpoint `/api/data` which returns:

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
  }
}
```

## License

MIT
