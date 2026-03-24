export async function summarizeFindings(investigationTitle: string, evidenceItems: { title: string, content: string, confidenceLabel?: string, confidenceScore?: number }[], customApiKey?: string) {
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    const fallbackDossier = `### ⚠️ AI Synthesis Unavailable (API/Network Issue)

Aletheia successfully completed the OSINT scan and gathered ${evidenceItems.length} evidence pieces, but the intelligence synthesis could not be generated.

The Google Gemini API connection failed, likely due to an invalid API key, network restriction, or model quota limits.

**Raw Evidence Summary:**
${evidenceItems.slice(0, 10).map((e, i) => `${i + 1}. **[${e.confidenceLabel || 'UNRATED'} - ${Math.round((e.confidenceScore || 0) * 100)}%]** ${e.title}`).join('\n')}

Please review the **Artifacts** tab to view the extracted data manually.

**Diagnostic Fix:**
Go to Vercel -> Settings -> Environment Variables, ensure \`GEMINI_API_KEY\` is correct, and Redeploy your application to ensure it reaches the edge function.`;

    if (!apiKey) {
        return fallbackDossier;
    }

    try {
        if (evidenceItems.length === 0) {
            return `### Intelligence Scan Complete\n\nThe target \`${investigationTitle}\` yielded 0 active digital footprints across the selected public OSINT nodes. \n\n**Analyst Recommendation**: Try scanning a related username or email to pivot the investigation.`;
        }

        const evidenceStr = evidenceItems.slice(0, 30).map(e => `- [${e.confidenceLabel || 'UNRATED'} Confidence (${Math.round((e.confidenceScore || 0) * 100)}%)] ${e.title}: ${e.content}`).join("\n");

        const systemPrompt = `You are Aletheia — a high-fidelity intelligence orchestration engine. Your mission is to extract actionable signal from noise. 

Internal Agent Specializations:
- **BioAgent (Biography & Identity)**: Map full names, birthdates, education, and career trajectories.
- **NetworkAgent (Connectivity)**: Identify linked associates, mutual connections, and social cluster concentrations.
- **GeoAgent (Location Intelligence)**: Extract physical addresses, frequent check-ins, or region-based identifiers.
- **InfraAgent (Technical Recon)**: Map domains, IPs, WHOIS metadata, and hosting infrastructure.
- **LeakAgent (Vulnerability & Compromise)**: Correlate credentials found in breach datasets and password markers.

CRITICAL INSTRUCTIONS:
- PRIORITY: If you find an email, phone number, or IP, highlight it as a "Primary Pivot".
- CONNECTIVITY: If multiple agents find overlapping data (e.g., a username on GitHub and a related repo on GitLab), synthesize the link.
- ZERO FILLER: Do not use preamble or "In conclusion". Deliver raw, high-signal intelligence.
- SOURCING: If evidence mentions a specific source (Interpol, Dark Web, DNS), cite it in the dossier.

Structure:
1. **Executive Dossier**: High-level exposure score and verified critical findings.
2. **Identity & Bio Profile**: Comprehensive reconstruction of the target's biography.
3. **Connectivity Grid**: Associates, linked usernames, and mutual connections.
4. **Digital Footprint (Infra/Geo)**: Technical infrastructure and physical region mapping.
5. **Exposure Map**: Breaches, leaks, and potential compromise vectors.
6. **Next-Phase Pivots**: 3 specific, recursive queries to further penetrate the target's anonymity.

[SIGINT_GEO_EXTRACTION]: 
At the EXTREME END of your response, after all markdown, include exactly one JSON block in this format: 
[SIGINT_GEO: {"locations": [{"city": "string", "country": "string", "lat": number, "lng": number, "source": "string"}]}]
Only include verified or high-probability locations found in the evidence.

[VITALITY_AUDIT_EXTRACTION]:
Immediately following the geo-block, include exactly one JSON block in this format:
[VITALITY_AUDIT: {"verdict": "Real" | "Synthetic" | "Suspicious", "confidence": number, "markers": ["string"]}]
Analyze visual evidence descriptions for GAINs, diffusion artifacts, or identity inconsistencies.

[ASSOCIATE_ANALYSIS_EXTRACTION]:
Immediately following the vitality-block, include exactly one JSON block in this format:
[ASSOCIATES: {"associates": [{"name": "string", "handle": "string", "relationship": "string", "confidence": number, "reasoning": "string"}]}]
Identify entities that lack formal links but show high patterns of proximity or mutual interactions.

Tone: Clinical, precise, and intelligence-grade.`;
        const prompt = `${systemPrompt}\nAnalyze the following OSINT findings for Operation "${investigationTitle}":\n\n${evidenceStr}\n\nGenerate the complete Threat Intelligence Dossier.`;

        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let resultText = "";
        let lastError = null;

        for (const modelName of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                
                // Using raw native fetch to completely bypass buggy SDK fetch wrappers
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3 }
                    })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`API Error ${res.status}: ${errorText}`);
                }

                const data = await res.json();
                
                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    resultText = data.candidates[0].content.parts[0].text;
                    break; 
                } else {
                    throw new Error("Invalid response format from Gemini API");
                }
            } catch (err: any) {
                console.warn(`Model ${modelName} REST fetch failed:`, err.message);
                lastError = err;
                // If the error is a definitive API Key rejection (400 Client Error for apiKey), 
                // we should stop trying other models and just return the fallback.
                if (err.message?.includes('API Error 400') && err.message?.includes('API key not valid')) {
                    return fallbackDossier; 
                }
                continue;
            }
        }

        if (!resultText) {
            console.error("All Gemini models failed. Returning fallback dossier.");
            return fallbackDossier;
        }

        return resultText;
    } catch (error: any) {
        console.error("AI Synthesis critically failed:", error);
        return fallbackDossier;
    }
}
