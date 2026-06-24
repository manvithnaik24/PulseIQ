/**
 * PulseIQ — Centralized API Configuration
 *
 * All backend URLs are derived from the VITE_API_BASE_URL environment variable.
 * - Local dev:  set VITE_API_BASE_URL=http://localhost:8000 in .env.local
 * - Production: set VITE_API_BASE_URL=https://your-backend.onrender.com in Render/Vercel dashboard
 *
 * NEVER hardcode http://localhost:8000 directly in component files.
 */

/** Base HTTP URL for REST API calls */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Derives WebSocket base URL from the API base URL automatically.
 * Converts http:// → ws:// and https:// → wss://
 */
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws')

/**
 * Convenience helper — builds a full API endpoint URL.
 * @example apiUrl('/api/v1/auth/me') → 'http://localhost:8000/api/v1/auth/me'
 */
export const apiUrl = (path) => `${API_BASE_URL}${path}`

/**
 * Resolves a file path (relative /static/... or absolute http) to a full URL.
 * Used for viewing uploaded reports and generated PDFs.
 * @example fileUrl('/static/reports/abc.pdf') → 'http://localhost:8000/static/reports/abc.pdf'
 */
export const fileUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}${path}`
}

/** Pre-built endpoint constants for type-safe usage */
export const ENDPOINTS = {
  // Auth
  ME:                 '/api/v1/auth/me',

  // Medications
  MEDICATIONS:        '/api/v1/medications/',
  MEDICATIONS_TAKEN:  '/api/v1/medications/taken',

  // AI
  AI_CHAT:            '/api/v1/ai/chat',
  AI_HISTORY:         '/api/v1/ai/history',

  // Symptoms
  SYMPTOMS_ANALYZE:   '/api/v1/symptoms/analyze',

  // Reports
  REPORTS:            '/api/v1/reports/',
  REPORTS_UPLOAD:     '/api/v1/reports/upload',
  REPORTS_ANALYZE:    '/api/v1/reports/analyze',
  REPORTS_GENERATE:   '/api/v1/reports/generate',

  // Family
  FAMILY_LIST:        '/api/v1/family/list',
  FAMILY_ADD:         '/api/v1/family/add',

  // Location
  LOCATION_UPDATE:    '/api/v1/location/update',

  // Nearby Services
  NEARBY_HOSPITALS:   '/api/v1/nearby/hospitals',
  NEARBY_PHARMACIES:  '/api/v1/nearby/pharmacies',
  NEARBY_AMBULANCES:  '/api/v1/nearby/ambulances',

  // SOS
  SOS_TRIGGER:        '/api/v1/sos/trigger',
  SOS_RESOLVE:        '/api/v1/sos/resolve',
  SOS_HISTORY:        '/api/v1/sos/history',

  // Health Check
  HEALTH_DB:          '/api/health/db',

  // WebSocket
  WS_HEALTH:          '/ws/health',
}
