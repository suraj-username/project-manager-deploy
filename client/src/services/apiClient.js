// --- DEPLOYMENT FIX ---
// In Vite, env variables must start with VITE_
// If VITE_API_BASE_URL is set (Production), use it.
// Otherwise, fall back to empty string '' which means "use relative path" (Localhost Proxy).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = async (url, options = {}) => {
  const token = localStorage.getItem('project-manager-token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };
  if (options.data) {
    config.body = JSON.stringify(options.data);
    delete config.data;
  }

  // Prepend the Base URL
  // If url starts with /, API_BASE_URL + url works perfectly.
  const fullUrl = `${API_BASE_URL}${url}`;

  const res = await fetch(fullUrl, config);

  if (res.status === 401) {
    console.error('Unauthorized. Logging out.');
    localStorage.removeItem('project-manager-token');
    return { unauthorized: true, status: res.status };
  }

  // Handle non-OK responses that aren't 401
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    } catch {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  }

  // Handle successful responses
  try {
    const data = await res.json();
    return data;
  } catch {
    return { success: true };
  }
};

export default apiClient;