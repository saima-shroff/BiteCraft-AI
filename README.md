# BiteCraft AI

> A smart pantry tracker that turns the ingredients you already own into AI-generated recipes — respecting your dietary needs and use-it-before-it-expires priorities.

## Project overview

BiteCraft AI helps you waste less food. You log what's in your kitchen (with quantities and expiry dates), see at a glance what's about to go off, and let a generative AI craft a structured recipe from the ingredients you pick. Missing ingredients can be pushed to a shopping list in one click, and when you tick items off as purchased they flow straight back into your pantry.

```
bitecraft-ai/
├── backend/    FastAPI + SQLAlchemy + SQLite API
│   ├── app/
│   │   ├── routers/   auth, pantry, recipes, shopping, ai
│   │   ├── models.py  schemas.py  security.py  database.py
│   ├── main.py
│   └── requirements.txt
└── frontend/   React (Vite) + Tailwind CSS single-page app
    └── src/    components, context, services, views
```

## Tech stack used

| Layer | Technology |
|---|---|
| Backend | Python 3.10+, FastAPI, SQLAlchemy 2, Pydantic v2 |
| Auth | JWT access tokens (PyJWT), bcrypt password hashing (Passlib) |
| Database | SQLite (local development) via SQLAlchemy ORM |
| Frontend | React 18, Vite, React Router, Axios, Tailwind CSS |
| AI | Google Gemini or OpenAI (selectable), JSON-schema constrained output |

## Key features and AI integrations

**Features**
- **Accounts & profiles** – register/login with JWT; store dietary preferences and allergies (Vegan, Gluten-Free, Halal, custom entries…).
- **Dashboard** – active-stock metrics, "expiring soon" alert banner, and a quick-action AI card.
- **Pantry management** – card grid with colour-coded freshness badges, add/edit modals, search.
- **AI Chef** – tick the ingredients you want to use, review dietary filters, generate a recipe card.
- **Recipe box** – save generated recipes and revisit them later.
- **Shopping list** – add missing recipe ingredients in one click; checking an item as purchased moves it into the pantry (merging quantities with existing stock).
- **Polished UI** – dark/light theme, instant form validation, subtle micro-interactions.
- All data is scoped per user.

**AI integration**
- `POST /api/ai/generate-recipe` builds a prompt from the selected pantry items and the user's dietary flags.
- **Strict structured output:** Gemini is called with `responseMimeType: application/json` + `responseSchema`; OpenAI with `json_schema` strict mode. The reply is then re-validated with Pydantic before being returned, so the frontend always receives `title`, `prep_time_mins`, `instructions[]` and `ingredients_json[]` (each flagged `in_pantry` true/false).
- **Resilience:** transient Gemini errors (429/500/503/504, timeouts) are retried with backoff, then a configurable fallback model is tried.
- Free-text user notes are treated as preferences only, not instructions. AI output is not a medical guarantee — always double-check allergens.

## Installation and setup guide

**Prerequisites:** Python 3.10+, Node.js 18+, and an API key for [Google Gemini](https://aistudio.google.com/apikey) or [OpenAI](https://platform.openai.com/api-keys).

### 1. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```
Edit `backend/.env` (see table below), then start the API:
```bash
python main.py                        
```
Database tables are created automatically on first start.

| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT signing secret. **Set a long random value:** `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default `1440`) |
| `DATABASE_URL` | Default `sqlite:///./bitecraft.db` |
| `CORS_ORIGINS` | Comma-separated allowed origins (default `http://localhost:5173`) |
| `AI_PROVIDER` | `gemini` (default) or `openai` |
| `GEMINI_API_KEY` | Required when `AI_PROVIDER=gemini` |
| `GEMINI_MODEL` | Default `gemini-3.5-flash-lite` |
| `GEMINI_FALLBACK_MODEL` | Tried if the primary stays overloaded (default `gemini-3.8-flash`) |
| `OPENAI_API_KEY` | Required when `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | Default `gpt-4o-mini` |

> Model availability changes over time. If you get a 404/503 from the provider, the error message is passed through — pick a currently available model in `.env`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                           
```
The Vite dev server proxies `/api` to `http://127.0.0.1:8000`, so start the backend first. For production run `npm run build` and serve `dist/` behind a reverse proxy that forwards `/api` to the backend.

## API usage instructions

**Endpoints** (all except register/login require `Authorization: Bearer <token>`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns token + user (password min 8 chars) |
| POST | `/api/auth/login` | Log in, returns token + user |
| GET / PUT | `/api/auth/me` | Get profile / update `dietary_flags` |
| GET / POST | `/api/pantry` | List (soonest expiry first) / add item |
| PUT / DELETE | `/api/pantry/{id}` | Update / delete item |
| GET / POST | `/api/recipes` | List / save recipe |
| DELETE | `/api/recipes/{id}` | Delete recipe |
| GET / POST | `/api/shopping-list` | List / add item |
| PUT | `/api/shopping-list/{id}` | Update; `{"is_purchased": true}` moves the item into the pantry |
| DELETE | `/api/shopping-list/{id}` | Delete item |
| POST | `/api/ai/generate-recipe` | Body `{"ingredient_ids":[…],"extra_notes":""}` → structured recipe |
| GET | `/api/health` | Health check |

**Generated recipe shape**
```json
{
  "title": "Simple Scrambled Eggs",
  "prep_time_mins": 5,
  "instructions": ["Whisk the eggs.", "Cook gently in a pan."],
  "ingredients_json": [
    { "name": "Eggs", "quantity": 2, "unit": "pcs", "in_pantry": true },
    { "name": "Butter", "quantity": 1, "unit": "tbsp", "in_pantry": false }
  ]
}
```
