
export interface FacialMatch {
  platform: string;
  confidence: number;  // 0.0 – 1.0
  score: number;       // 0 – 100 raw FaceCheck score
  url: string;
  thumbnailBase64?: string;  // base64 webp from FaceCheck
  timestamp: string;
  isVerified?: boolean;
  extractedIdentity?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Maps raw FaceCheck.id API items (from the reverseImageSearch connector results)
 * into the FacialMatch interface consumed by the UI.
 *
 * This is NOT a data-fetching function — the actual API call happens in
 * src/connectors/reverseImage.ts during the scan phase. This module is
 * responsible only for the in-memory data shape used by dashboard components.
 */
export function mapFaceCheckResults(connectorResults: any[]): FacialMatch[] {
  const allowedSources = [
    'facecheck_id', 
    'google_vision_web_detection', 
    'google_vision_similar', 
    'serpapi_google_reverse', 
    'serpapi_google_lens', 
    'bing_visual_api'
  ];

  return connectorResults
    .filter(r => r.category === 'image_search' && allowedSources.includes(r.metadata?.source))
    .map(r => ({
      platform: r.platform || 'Unknown',
      confidence: r.confidenceScore || 0,
      score: r.metadata?.faceMatchScore || Math.round((r.confidenceScore || 0) * 100),
      url: r.url,
      thumbnailBase64: r.metadata?.thumbnailBase64 || r.metadata?.thumbnailUrl,
      timestamp: new Date().toISOString(),
      isVerified: !!r.isVerified,
      extractedIdentity: r.metadata?.extractedIdentity || r.metadata?.entity || r.metadata?.identifiedEntity || null,
      metadata: r.metadata
    }))
    .sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0) || b.score - a.score);
}

/**
 * Legacy stub — kept for backwards compatibility with any component
 * that still calls runFacialAI() directly. Returns empty array so
 * the UI falls back to showing 0 matches rather than fake data.
 *
 * @deprecated Use reverseImageSearch() connector + mapFaceCheckResults() instead.
 */
export async function runFacialAI(_target: string): Promise<FacialMatch[]> {
  console.warn('[visualIntel] runFacialAI() is deprecated. Use the reverseImage connector.');
  return [];
}
