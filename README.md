# Land Area Mapper

An interactive web application to mark land boundaries on a satellite map and calculate the enclosed area — including Acre + Guntha display, a popular format used by land owners in India.

> ⚠️ **Disclaimer**: This tool provides approximate map-based measurements only. It is NOT a legally certified land survey.

## Features

- 🛰️ **Satellite Map** — Google Maps HYBRID (satellite + labels)
- 📍 **Click to Mark** — Place boundary points by clicking on the map
- 🔗 **Live Polygon** — Points are connected with lines as you mark
- 🔍 **Location Search** — Find any location using Google Places Autocomplete
- 📐 **Geodesic Area** — Real-world area using lat/lng coordinates (not pixels)
- 📏 **Perimeter** — Total boundary length in meters and feet
- 🧮 **Multiple Units** — sq meters, sq feet, acres, guntha, acres + guntha
- ↩️ **Undo / Clear** — Edit your boundary before or after calculation
- 🖱️ **Draggable Markers** — Move individual points to refine the boundary

## Area Units Supported

| Unit | Notes |
|------|-------|
| Square Meter | Base unit from geodesic calculation |
| Square Feet | 1 m² = 10.7639 ft² |
| Acre | 1 acre = 4046.8564224 m² |
| Guntha | 1 guntha = 101.17 m² (1 acre = 40 guntha) |
| **Acre + Guntha** | Land-owner friendly: e.g. "1 Acre 30 Guntha" |

## Quick Start

### 1. Clone and install

```bash
cd land-area-mapper
npm install
```

### 2. Configure your Google Maps API Key

```bash
cp .env.example .env
# Edit .env and add your API key
```

Get your API key at [console.cloud.google.com](https://console.cloud.google.com/google/maps-apis).

Enable these APIs:
- **Maps JavaScript API**
- **Places API**

### 3. Run

```bash
npm run dev
```

Open http://localhost:5173

## How to Use

1. **Search** for a location using the search box at the top
2. Click **Start Marking** to enter marking mode
3. **Click on the map** to place boundary points — a numbered marker appears at each click
4. Click **Calculate Area** (needs ≥ 3 points) to close the polygon and compute the area
5. Select a **unit** in the sidebar (e.g., "Acre + Guntha")
6. View the **Measurement Summary** card with area, perimeter, and boundary point count
7. Use **Undo Last Point** to remove the latest marker, or **Clear All** to start fresh

## Conversion Constants Used

```
1 acre      = 4046.8564224 m²
1 acre      = 43,560 ft²
1 acre      = 40 guntha
1 guntha    = 101.17141056 m²
1 guntha    = 1,089 ft²
```

Acre + Guntha formula:
```
total_acres = area_m² / 4046.8564224
whole_acres = floor(total_acres)
guntha      = (total_acres - whole_acres) * 40
```

## Tech Stack

- React 19 + Vite
- Google Maps JavaScript API (`@googlemaps/js-api-loader`)
- Google Places API (location search)
- CSS Modules (no UI library needed)
- Pure JavaScript geodesic math (no extra library)

## Project Structure

```
src/
├── App.jsx                    # Main app layout and state
├── App.css                    # Global styles
├── main.jsx                   # React entry point
├── hooks/
│   ├── useGoogleMap.js        # Loads and initialises Google Maps
│   └── usePolygonMarker.js    # Manages markers, polyline, polygon
├── components/
│   ├── ControlPanel.jsx       # Sidebar with all buttons + unit selector
│   ├── ControlPanel.module.css
│   ├── ResultCard.jsx         # Measurement result display
│   ├── ResultCard.module.css
│   ├── SearchBox.jsx          # Google Places Autocomplete search
│   └── SearchBox.module.css
└── utils/
    └── areaCalculation.js     # Geodesic area, perimeter, unit conversions
```
