import { ConnectorResult } from './types';

/**
 * Vehicle Registry Lookup Connector
 * Simulates pulling registration records, VIN numbers, registered owners,
 * and POI threat flags based on license plate queries.
 */
export async function vehicleSearch(plate: string, jurisdiction?: string): Promise<ConnectorResult> {
    const p = plate.toUpperCase().trim().replace(/^(PLATE:|VEHICLE:)/, '').trim();
    const jur = (jurisdiction || "California").toUpperCase().trim();
    
    // Detailed list of vehicle templates for realistic results
    const templates = [
        { make: "Ford", model: "Mustang", year: 2021, color: "Shadow Black", vinPrefix: "1FA6P8CF0M", engine: "5.0L V8" },
        { make: "Tesla", model: "Model S", year: 2022, color: "Solid Black", vinPrefix: "5YJSA1E20N", engine: "Dual Motor Electric" },
        { make: "Toyota", model: "RAV4", year: 2019, color: "Super White", vinPrefix: "JTMDFRFV8K", engine: "2.5L I4" },
        { make: "BMW", model: "530i", year: 2020, color: "Alpine White", vinPrefix: "WBAJR7C5XF", engine: "2.0L I4 Turbo" },
        { make: "Honda", model: "Civic", year: 2018, color: "Rallye Red", vinPrefix: "1HGFC2F80J", engine: "1.5L I4 Turbo" },
    ];
    
    // Choose template deterministically based on plate characters
    const charSum = p.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = charSum % templates.length;
    const template = templates[index];
    
    // List of deterministic registered owners
    const owners = [
        "Johnathan Vance",
        "Marcus Sterling",
        "Sarah Jenkins",
        "Evelyn Brooks",
        "Daniel Kincaid"
    ];
    const owner = owners[index];
    const vinFull = `${template.vinPrefix}RE${p.replace(/[^A-Z0-9]/g, '').slice(0, 4)}789`;
    
    // Stolen vehicle watchlist mock (index 0 is active, others are cleared)
    const isWatchlisted = index === 0;
    
    return {
        connectorType: 'vehicle_registry',
        query: plate,
        generatedAt: new Date().toISOString(),
        results: [
            {
                title: `Vehicle Registration Record — Plate: ${p} (${jur})`,
                url: `https://registry.aletheia.intel/plates/${p}`,
                category: 'vehicle_registry',
                confidenceScore: 0.95,
                metadata: {
                    plate: p,
                    jurisdiction: jur,
                    make: template.make,
                    model: template.model,
                    year: template.year,
                    color: template.color,
                    engine: template.engine,
                    vin: vinFull,
                    owner: owner,
                    status: 'ACTIVE',
                    expirationDate: '2027-04-18',
                    watchlistStatus: isWatchlisted ? 'WANTED - SUSPECT VEHICLE' : 'CLEARED'
                },
                description: `**Vehicle Intelligence Summary:**
* **Plate Number:** ${p}
* **Jurisdiction:** ${jur}
* **Make/Model:** ${template.year} ${template.make} ${template.model}
* **Body Details:** ${template.color} • ${template.engine}
* **VIN:** \`${vinFull}\`
* **Registered Owner:** **${owner}**
* **Registration Status:** ACTIVE (Expires 2027-04-18)
* **Threat Watchlist Flag:** ${isWatchlisted ? '⚠️ **ACTIVE FLAG: ASSOCIATED WITH PERSON OF INTEREST**' : '✅ **CLEARED**'}`
            }
        ]
    };
}
