FROM python:3.11-slim

ENV HOME=/root

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml ./

RUN pip install --no-cache-dir \
    "httpx[http2]>=0.24.0" \
    "python-dotenv>=1.0.0" \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.30.0" \
    "jinja2>=3.1.0" \
    "aiosqlite>=0.20.0" \
    "apscheduler>=3.10.0" \
    "python-jose[cryptography]>=3.3.0" \
    "python-multipart>=0.0.9" \
    "playwright>=1.40.0"

RUN playwright install --with-deps chromium

COPY . .

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["sh", "-c", "uvicorn web.app:app --host 0.0.0.0 --port ${PORT:-8080}"]
