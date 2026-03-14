/**
 * Ensure the socket server URL uses a secure protocol (https:// or wss://)
 * when the page is loaded over HTTPS.  This prevents Mixed Content errors
 * where a browser blocks insecure HTTP (http://) or WebSocket (ws://)
 * connections from an HTTPS page.
 *
 * socket.io-client derives the WebSocket scheme directly from the URL scheme:
 *   http://  →  ws://   (blocked on HTTPS pages)
 *   https:// →  wss://  (allowed everywhere)
 *
 * Raw WebSocket schemes are also upgraded:
 *   ws://   →  wss://  (blocked on HTTPS pages)
 *
 * @param {string} url - The socket server URL to sanitise.
 * @returns {string} The URL with insecure schemes upgraded on secure pages.
 */
export const getSecureSocketUrl = (url) => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return url.replace(/^(http|ws):\/\//, '$1s://')
  }
  return url
}
