from fastapi import FastAPI

app = FastAPI(title="Kariyer Rotası AI Service")


@app.get("/health")
def health():
    return {"status": "ok"}

