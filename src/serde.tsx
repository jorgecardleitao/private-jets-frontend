import CSV from './csv'

export function deserialize(content: string, keys: string[]): Object[] {
    const data: any[][] = CSV.parse(content);
    console.assert(data[0].toString() === keys.toString());

    const zip = (a, b) => a.map((k, i) => [k, b[i]]);

    return data.slice(1).map(row => zip(keys, row)).map(Object.fromEntries)
}
