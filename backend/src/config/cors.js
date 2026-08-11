const DEFAULT_LOCAL_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAllowedOrigins() {
  return Array.from(
    new Set([
      ...DEFAULT_LOCAL_ORIGINS,
      ...parseOrigins(process.env.CLIENT_URL),
      ...parseOrigins(process.env.CLIENT_URLS),
    ])
  );
}

export function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(origin);
}
