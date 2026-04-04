class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? "No se pudo completar la solicitud.",
      response.status,
      payload?.error?.details
    );
  }

  return payload?.data;
}

function withQuery(path, params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      search.set(key, value);
    }
  });

  const queryString = search.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export const apiClient = {
  get(path, params) {
    return request(withQuery(path, params));
  },
  post(path, body) {
    return request(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },
  patch(path, body) {
    return request(path, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },
  delete(path) {
    return request(path, {
      method: "DELETE"
    });
  }
};

export { ApiError };
