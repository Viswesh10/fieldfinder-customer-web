const prefix = 'ff.customer.demo.'

export function readDemo(key, fallback) {
  try {
    const value = localStorage.getItem(prefix + key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function writeDemo(key, value) {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value))
  } catch (error) {
    console.warn('SportiLand demo storage could not be saved:', error)
  }
}

export function clearDemoSession() {
  try { sessionStorage.removeItem(prefix + 'session') } catch {}
}

export function getDemoSession() {
  try {
    const value = sessionStorage.getItem(prefix + 'session')
    return value ? JSON.parse(value) : null
  } catch { return null }
}

export function setDemoSession(user) {
  try { sessionStorage.setItem(prefix + 'session', JSON.stringify(user)) } catch {}
}
