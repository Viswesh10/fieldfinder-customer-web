// Customer and Owner applications share the same Spring Boot API.
// Use the current host so LAN testing works from Android/iOS on the same Wi-Fi.
const API_BASE = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8080`

function readCookie(name) {
  const prefix = `${name}=`
  const entry = document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith(prefix))
  if (!entry) return ''
  try { return decodeURIComponent(entry.slice(prefix.length)) } catch { return entry.slice(prefix.length) }
}

async function ensureCsrfToken() {
  let token = readCookie('XSRF-TOKEN')
  if (token) return token
  const response = await fetch(`${API_BASE}/api/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) throw new Error('Could not initialise secure sign-in. Check the SportiLand backend.')
  const body = await response.json().catch(() => ({}))
  token = readCookie('XSRF-TOKEN') || body.token || ''
  if (!token) throw new Error('The backend did not provide a security token. Refresh and try again.')
  return token
}

export async function backendRequest(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase()
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers['X-XSRF-TOKEN'] = await ensureCsrfToken()
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    credentials: 'include',
    headers
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) {
    const message = body.message || body.error || `API request failed (${response.status})`
    throw new Error(message)
  }
  return body.data ?? body
}

export { API_BASE }
