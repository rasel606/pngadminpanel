/**
 * Ensure the socket server URL uses a secure protocol (https://) when the
 * page is loaded over HTTPS.  This prevents Mixed Content errors where a
 * browser blocks insecure WebSocket (ws://) connections from an HTTPS page.
 *
 * socket.io-client derives the WebSocket scheme directly from the URL scheme:
 *   http://  →  ws://   (blocked on HTTPS pages)
 *   https:// →  wss://  (allowed everywhere)
 *
 * @param {string} url - The socket server URL to sanitise.
 * @returns {string} The URL with http:// replaced by https:// on secure pages.
 */
export const getSecureSocketUrl = (url) => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return url.replace(/^http:\/\//, 'https://')
  }
  return url
}
