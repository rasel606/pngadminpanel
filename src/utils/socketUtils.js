const DEFAULT_SOCKET_ORIGIN = 'https://api.tiger55.online'
const DEFAULT_API_ORIGIN = 'https://api.tiger55.online/api'

const withProtocol = (value, protocol) => {
  if (value.startsWith('//')) {
    return `${protocol}${value}`
  }

  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    return `${protocol}//${value}`
  }

  return value
}

/**
 * Normalise an HTTP API base URL and force https:// on HTTPS pages.
 */
export const getSecureHttpUrl = (url) => {
  const rawValue = (url || DEFAULT_API_ORIGIN).trim()
  const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:'

  const defaultProtocol = isHttpsPage ? 'https:' : 'http:'
  const normalised = withProtocol(rawValue, defaultProtocol)

  if (!isHttpsPage) {
    return normalised
  }

  return normalised.replace(/^http:\/\//i, 'https://')
}

/**
 * Normalise the socket server URL and force a secure scheme on HTTPS pages.
 * This prevents mixed-content failures when socket.io upgrades to WebSocket.
 */
export const getSecureSocketUrl = (url) => {
  const rawValue = (url || DEFAULT_SOCKET_ORIGIN).trim()
  const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:'

  const defaultProtocol = isHttpsPage ? 'https:' : 'http:'
  const normalised = withProtocol(rawValue, defaultProtocol)

  if (!isHttpsPage) {
    return normalised
  }

  return normalised.replace(/^(http|ws):\/\//i, '$1s://')
}

/**
 * Build a websocket endpoint from an origin/base URL and target path.
 */
export const getWebSocketUrl = (baseUrl, path = '') => {
  const secureBase = getSecureSocketUrl(baseUrl)
  const hasWindow = typeof window !== 'undefined'
  const isHttpsPage = hasWindow && window.location.protocol === 'https:'

  let host
  let protocol = isHttpsPage ? 'wss:' : 'ws:'

  try {
    const parsed = new URL(secureBase)
    host = parsed.host

    if (!isHttpsPage) {
      protocol = parsed.protocol === 'https:' || parsed.protocol === 'wss:' ? 'wss:' : 'ws:'
    }
  } catch {
    host = secureBase.replace(/^(https?|wss?):\/\//i, '').split('/')[0]
  }

  const normalizedPath = path ? `/${path.replace(/^\/+/, '')}` : ''
  return `${protocol}//${host}${normalizedPath}`
}
