# Repository Guidelines

Drogaria Runner is a web-based runner game with a Python leaderboard backend.

## Project Structure & Module Organization

- **`index.html`**: The entire frontend application, including HTML, CSS, and JavaScript. It uses the HTML5 Canvas API for game rendering and DOM elements for menus.
- **`cutscenes.js`**: Handles video-based cutscenes and dialogue overlays.
- **`api_server.py`**: A FastAPI-based REST API for managing the leaderboard. It handles score submissions and retrieves rankings using SQLite.
- **`_worker.js` & `wrangler.jsonc`**: Configuration for Cloudflare Workers/Pages deployment.
- **`requirements.txt`**: Python dependencies for the backend.

## Build, Test, and Development Commands

### Backend (API Server)

The backend requires `fastapi`, `uvicorn`, and `pydantic`.

- **Start server**: `python api_server.py` or `uvicorn api_server:app --reload --port 8000`
- **Default API URL**: `http://localhost:8000`

### Frontend

- **Run**: Open `index.html` directly in a web browser or serve it via a local web server.
- **API Configuration**: The `API` constant in `index.html` defines the backend address.

### Deployment

- **Wrangler**: Use `npx wrangler dev` to test locally in a Workers-like environment.

## Coding Style & Naming Conventions

- **Python**: Follows FastAPI and Pydantic conventions. Type hints are encouraged. Use `snake_case`.
- **JavaScript**: Vanilla JS with a fixed-timestep game loop (`60 FPS`). Global game state is managed in the `game` object. Use `camelCase`.
- **CSS**: Uses custom properties and utility classes for consistent styling.

## Testing Guidelines

No automated test suite is currently implemented. Verification should be done manually via the browser console.
- **Game State Export**: Use `window.render_game_to_text()` in the console to get a JSON representation of the current game state.
- **Manual Tick**: Use `window.advanceTime(ms)` to manually step the game simulation.
