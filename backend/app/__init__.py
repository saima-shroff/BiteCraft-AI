import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from .database import Base, engine  # noqa: E402


def create_app() -> FastAPI:
    from . import models  # noqa: F401
    from .routers import ai, auth, pantry, recipes, shopping

    Base.metadata.create_all(bind=engine)
    app = FastAPI(title="BiteCraft AI", version="1.0.0")
    origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    for r in (auth, pantry, recipes, shopping, ai):
        app.include_router(r.router)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app
