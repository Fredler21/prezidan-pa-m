/*
 * Projection of src/data/haiti-geo.ts: equirectangular around 73.05 W, 19.06 N, scaled so the
 * whole country is 2 map units wide, y pointing north. Kept apart from the polygon data so the
 * main bundle can project a point without pulling the map in.
 */
const LON0 = -73.0514;
const LAT0 = 19.0557;
const K = Math.cos((LAT0 * Math.PI) / 180);
const S = 2 / (2.8585 * K);

export function toMap(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * K * S, (lat - LAT0) * S];
}
