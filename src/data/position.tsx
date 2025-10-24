export interface Position {
    readonly timestamp: string
    readonly latitude: number
    readonly longitude: number
    readonly altitude?: number
}

export async function fetchPositions(icao_number: string, month: string): Promise<Position[]> {
    const url = `https://private-jets.fsn1.your-objectstorage.com/position/icao_number=${icao_number}/month=${month}/data.json`
    return fetch(url, { mode: 'cors' }).then(response => response.ok ? response.json() : [])
}
