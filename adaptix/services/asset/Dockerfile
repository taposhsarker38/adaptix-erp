FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create a non-root user
RUN addgroup --system app && adduser --system --ingroup app app
USER app

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
