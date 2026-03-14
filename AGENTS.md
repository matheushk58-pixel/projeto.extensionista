# Repository Guidelines

Drogaria Runner is a web-based runner game with a Python leaderboard backend.

## Project Structure & Module Organization

- **`index.html`**: The entire frontend application, including HTML, CSS, and JavaScript. It uses the HTML5 Canvas API for game rendering and provides hooks for debugging and testing.
- **`api_server.py`**: A FastAPI-based REST API for managing the leaderboard. It handles score submissions and retrieves rankings.
- **`leaderboard.db`**: A SQLite database used by the API server to persist player scores.

## Build, Test, and Development Commands

### Backend (API Server)

The backend requires `fastapi`, `uvicorn`, and `pydantic`.

- **Start server**: `python api_server.py` or `uvicorn api_server:app --reload --port 8000`
- **Default API URL**: `http://localhost:8000`

### Frontend

- **Run**: Open `index.html` directly in a web browser.
- **API Configuration**: The `API` constant in `index.html` (around line 400) defines the backend address.

### Testing & Debugging

- **Game State Export**: Use `window.render_game_to_text()` in the browser console to get a JSON representation of the current game state (player position, active obstacles, score, etc.).
- **Manual Tick**: Use `window.advanceTime(ms)` to manually step the game simulation.

## Coding Style & Naming Conventions

- **Python**: Follows FastAPI and Pydantic conventions. Type hints are encouraged for API models.
- **JavaScript**: Vanilla JS with a fixed-timestep game loop (`60 FPS`). Global game state is managed in the `game` object.
- **Naming**: Use `snake_case` for Python and `camelCase` for JavaScript.

## Testing Guidelines

No automated test suite is currently implemented. Verification should be done manually via the browser console using the provided testing hooks (`render_game_to_text`).
