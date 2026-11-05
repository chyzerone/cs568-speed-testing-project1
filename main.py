import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import (
    FileResponse,
    Response,
    StreamingResponse,
)
from fastapi.staticfiles import StaticFiles


BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)


@app.get("/")
def home():
    return FileResponse(BASE_DIR / "static" / "index.html")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/ping")
def ping():
    return Response(
        content=b"ok",
        media_type="text/plain",
        headers={"Cache-Control": "no-store"}
    )


# One reusable 256 KiB block of high-entropy test data.
DOWNLOAD_CHUNK = os.urandom(256 * 1024)


def generate_download_data(size_bytes: int):
    remaining_bytes = size_bytes

    while remaining_bytes > 0:
        chunk_size = min(remaining_bytes, len(DOWNLOAD_CHUNK))
        yield DOWNLOAD_CHUNK[:chunk_size]
        remaining_bytes -= chunk_size


@app.get("/api/download")
def download(
    size: int = Query(
        default=4 * 1024 * 1024,
        ge=256 * 1024,
        le=32 * 1024 * 1024
    )
):
    return StreamingResponse(
        generate_download_data(size),
        media_type="application/octet-stream",
        headers={
            "Cache-Control": "no-store, no-transform",
            "Content-Length": str(size),
            "X-Content-Type-Options": "nosniff"
        }
    )

# Maximum upload payload: 16 MiB.
MAX_UPLOAD_BYTES = 16 * 1024 * 1024

@app.post("/api/upload")
async def upload(request: Request):
    received_bytes = 0

    # Read incoming request data in chunks.
    async for chunk in request.stream():
        received_bytes += len(chunk)

        # Reject requests exceeding the upload limit.
        if received_bytes > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Upload size limit exceeded"
            )

    if received_bytes == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty upload is not allowed"
        )

    # Confirm how many bytes were actually read.
    return {
        "status": "ok",
        "received_bytes": received_bytes
    }
