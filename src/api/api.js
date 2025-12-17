const API_BASE = "http://localhost:8000/api";

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = data?.detail || JSON.stringify(data);
    throw new Error(error);
  }

  return data;
}

export default request;
