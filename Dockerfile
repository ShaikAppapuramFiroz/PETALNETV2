# ================= FRONTEND BUILD =================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./

# More reliable than npm ci on slow networks
RUN npm install

COPY frontend .

ARG VITE_API_URL
ARG VITE_EMAILJS_SERVICE_ID
ARG VITE_EMAILJS_TEMPLATE_ID
ARG VITE_EMAILJS_PUBLIC_KEY

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_EMAILJS_SERVICE_ID=${VITE_EMAILJS_SERVICE_ID}
ENV VITE_EMAILJS_TEMPLATE_ID=${VITE_EMAILJS_TEMPLATE_ID}
ENV VITE_EMAILJS_PUBLIC_KEY=${VITE_EMAILJS_PUBLIC_KEY}

RUN npm run build


# ================= BACKEND =================
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt .

# Increase timeout + stable PyPI
RUN pip install --upgrade pip \
    && pip install --no-cache-dir --default-timeout=300 \
       -i https://pypi.org/simple \
       -r requirements.txt

COPY backend /app/backend

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /app/static

ENV PORT=8000

WORKDIR /app/backend
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
