import { BASE_URL } from "./constants"

export interface Position {
    readonly timestamp: string
    readonly latitude: number
    readonly longitude: number
    readonly altitude?: number
}

export async function fetchPositions(icao_number: string, month: string): Promise<Position[]> {
    const url = `${BASE_URL}/position/icao_number=${icao_number}/month=${month}/data.json`
    return fetch(url, { mode: 'cors' }).then(response => response.ok ? response.json() : [])
}
