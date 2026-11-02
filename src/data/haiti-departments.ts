import type { DepartmentId, L10n } from '../types';

/*
 * Facts shown on the home page tour, one chapter per department.
 * Area and population: Wikipedia, "Departments of Haiti" (population = IHSI estimate, 2015).
 * Chef-lieu coordinates: Wikipedia infoboxes (WGS 84, rounded to 0.001°).
 */
export interface DepartmentFacts {
  id: DepartmentId;
  capital: L10n;
  /** [longitude, latitude] of the chef-lieu. */
  capitalLonLat: [number, number];
  areaKm2: number;
  population2015: number;
}

export const DEPARTMENT_FACTS: readonly DepartmentFacts[] = [
  { id: 'ouest', capital: { ht: 'Pòtoprens', fr: 'Port-au-Prince', en: 'Port-au-Prince' }, capitalLonLat: [-72.335, 18.539], areaKm2: 4983, population2015: 4029705 },
  { id: 'sud-est', capital: { ht: 'Jakmèl', fr: 'Jacmel', en: 'Jacmel' }, capitalLonLat: [-72.535, 18.234], areaKm2: 2034, population2015: 632601 },
  { id: 'nippes', capital: { ht: 'Miragwàn', fr: 'Miragoâne', en: 'Miragoâne' }, capitalLonLat: [-73.091, 18.445], areaKm2: 1268, population2015: 342525 },
  { id: 'sud', capital: { ht: 'Okay', fr: 'Les Cayes', en: 'Les Cayes' }, capitalLonLat: [-73.746, 18.193], areaKm2: 2654, population2015: 774976 },
  { id: 'grand-anse', capital: { ht: 'Jeremi', fr: 'Jérémie', en: 'Jérémie' }, capitalLonLat: [-74.117, 18.65], areaKm2: 1912, population2015: 468301 },
  { id: 'artibonite', capital: { ht: 'Gonayiv', fr: 'Gonaïves', en: 'Gonaïves' }, capitalLonLat: [-72.683, 19.45], areaKm2: 4987, population2015: 1727524 },
  { id: 'nord-ouest', capital: { ht: 'Pòdepè', fr: 'Port-de-Paix', en: 'Port-de-Paix' }, capitalLonLat: [-72.833, 19.933], areaKm2: 2103, population2015: 728807 },
  { id: 'nord', capital: { ht: 'Okap', fr: 'Cap-Haïtien', en: 'Cap-Haïtien' }, capitalLonLat: [-72.198, 19.759], areaKm2: 2115, population2015: 1067177 },
  { id: 'nord-est', capital: { ht: 'Fòlibète', fr: 'Fort-Liberté', en: 'Fort-Liberté' }, capitalLonLat: [-71.839, 19.665], areaKm2: 1623, population2015: 393967 },
  { id: 'centre', capital: { ht: 'Ench', fr: 'Hinche', en: 'Hinche' }, capitalLonLat: [-72.005, 19.143], areaKm2: 3487, population2015: 746236 },
];

/** Order of the tour: the capital first, then the south coast westward, then up the west coast and across the north, ending in the centre. */
export const TOUR: readonly DepartmentId[] = DEPARTMENT_FACTS.map((d) => d.id);
