/**
 * Maritime Intelligence Map – Static fallback seed data.
 *
 * Positions, routes and headings match exactly what the backend
 * computes via _interpolate_position() so the map looks identical
 * whether it loads from /api/v1/map/fleet or this local fallback.
 *
 * FLEET: 4 active BPCL/chartered tankers across the Arabian Sea.
 *   1. MT Rajput   – VLCC,   Ras Tanura → Kochi    (highRisk, 45%)
 *   2. MT Horizon  – Suezmax, Basrah → Mumbai       (delayed,  30%)
 *   3. MT Sagar Queen – Aframax, Fujairah → Sikka   (onTrack,  65%)
 *   4. MT Bharat   – VLCC,   Abu Dhabi → Kochi      (critical, 40%)
 */

export type VesselStatus = 'normal' | 'delayed' | 'high-risk' | 'highRisk' | 'onTrack' | 'critical';

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  flag: string;
  type: 'VLCC' | 'Suezmax' | 'Aframax' | 'Panamax' | 'Product Tanker' | 'LNG Carrier';
  dwt: number;
  gt: number;
  nt: number;
  length: number;
  isBpcl: boolean;
  ownership?: string;
  status: VesselStatus;
  speedKnots: number;
  headingDeg: number;
  position: [number, number]; // [lat, lng]
  origin: string;
  destination: string;
  destinationCoords: [number, number];
  etaUtc: string;
  etaIst: string;
  riskScore: number;       // 0-100
  delayProbability: number;
  pastRoute: Array<[number, number]>;
  currentRoute: Array<[number, number]>;
  recommendedRoute: Array<[number, number]>;
  lastUpdateMin: number;
  routeId?: string;
  routeCode?: string;
  progressPct?: number;
  cargoType?: string;
  cargoVolumeBbl?: number;
  vesselDailyRate?: number;
  confidence?: number;
  routeLengthNm?: number;
}

export interface Port {
  id: string;
  name: string;
  country: string;
  position: [number, number];
  congestionPct: number;
  vesselsWaiting: number;
  avgWaitHours: number;
  jettyOccupancyPct: number;
  isBpclHub: boolean;
}

export interface RiskZone {
  id: string;
  name: string;
  type: 'geopolitical' | 'piracy' | 'weather' | 'congestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  polygon: Array<[number, number]>;
  description: string;
  vesselsAffected: number;
}

export interface RaePin {
  id: string;
  position: [number, number];
  title: string;
  match: number;
  date: string;
  summary: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE WAYPOINTS (mirrored from backend/app/data/seed_data.py)
// ─────────────────────────────────────────────────────────────────────────────

// R001: Novorossiysk → Sikka
const R001: [number, number][] = [
  [44.7, 37.8], [40.0, 26.0], [33.0, 24.0], [31.0, 32.5], [29.0, 33.0], [20.0, 39.0], [12.0, 44.0], [14.0, 52.0], [20.0, 62.0], [22.42, 69.80]
];

// R002: Basrah → Mumbai/JNPT
const R002: [number, number][] = [
  [30.1, 48.9], [28.6, 50.1], [27.18, 51.22], [26.57, 53.36], [26.19, 54.39], [26.13, 55.34], [26.4, 56.4], [26.51, 56.54], [26.42, 56.76], [25.96, 56.93], [25.5, 57.1], [24.0, 59.0], [23.45, 61.55], [22.84, 64.44], [22.57, 65.72], [22.3, 67.0], [20.80, 69.59], [20.0, 70.0], [19.0, 72.4], [18.94, 72.80]
];

// R003: Fujairah → Kochi
const R003: [number, number][] = [
  [25.17, 56.35], [24.0, 59.0], [21.4, 62.3], [19.4, 64.9], [17.5, 66.2], [15.6, 67.5], [13.7, 69.9], [12.6, 71.4], [9.96, 76.23]
];

// R004: Houston → Mumbai via Suez
const R004: [number, number][] = [
  [29.3423, -94.7696], [29.3379, -94.6878], [29.3068, -94.6251], [29.1479, -94.3779], [29.1321, -93.6685], [29.13, -93.214], [28.867366, -92.411602], [28.782322, -92.151777], [28.645662, -91.842882], [28.515764, -91.549269], [28.409415, -91.308884], [27.998808, -90.380776], [27.783021, -89.893027], [27.727009, -89.766422], [27.22807, -88.638654], [27.0444, -88.2235], [27.029745, -88.194005], [26.617905, -87.365118], [26.367057, -86.86025], [26.280286, -86.685611], [25.874468, -85.868843], [25.160345, -84.431568], [24.3, -82.7], [24.2187, -81.825], [24.504, -80.8143], [24.513328, -80.797078], [24.7537, -80.3533], [25.114792, -80.029414], [25.594487, -78.144881], [25.857341, -77.112232], [25.8588, -77.1065], [25.946026, -76.61827], [26.002864, -76.300128], [26.067607, -76.327093], [26.346963, -75.657688], [26.452033, -75.405913], [26.891691, -74.352383], [27.014868, -74.057221], [27.091075, -73.87461], [27.108831, -73.832064], [27.330978, -73.299744], [27.41841, -73.090234], [27.531894, -72.818299], [27.804838, -72.164258], [27.822254, -72.122525], [28.422096, -70.685156], [28.704929, -70.007418], [28.765464, -69.862361], [29.103898, -69.051387], [29.1243, -69.0025], [29.303401, -68.396402], [29.613372, -67.347424], [30.079066, -65.771462], [30.338901, -64.892149], [31.103811, -62.303605], [31.186227, -62.024698], [31.784301, -60.000749], [32.424706, -57.833543], [32.4371, -57.7916], [32.454415, -57.742406], [33.912816, -53.598858], [34.6437, -51.5223], [34.829318, -50.002027], [35.006266, -48.55276], [35.433693, -45.051994], [35.448318, -44.932205], [36.050314, -40.00166], [36.1836, -38.91], [36.271266, -35.95958], [36.330185, -33.976613], [36.448298, -30.001492], [36.5022, -28.1874], [36.409169, -23.891026], [36.408059, -23.839759], [36.378758, -22.486564], [36.324949, -20.001544], [36.29, -18.3875], [36.201224, -15.087759], [36.143675, -12.948729], [36.134522, -12.608538], [36.040957, -9.130793], [36.035528, -8.929005], [36.033084, -8.838176], [36.015813, -8.196204], [35.995663, -7.447269], [35.95, -5.75], [35.968819, -5.354867], [35.97289, -5.269383], [36.0, -4.7], [36.156455, -3.683043], [36.158352, -3.670714], [36.220888, -3.264225], [36.324512, -2.590675], [36.377724, -2.244793], [36.473171, -1.62439], [36.666667, -0.366667], [37.2, 3.1], [37.4, 7.5], [37.4851, 10.1431], [37.489085, 10.372293], [37.5, 11.0], [37.454891, 11.172235], [37.283186, 11.827836], [37.215493, 12.086301], [37.212689, 12.097004], [37.209117, 12.110644], [36.907095, 13.263819], [36.4, 15.2], [36.086854, 16.726588], [35.845726, 17.902084], [35.126694, 21.407365], [34.8, 23.0], [34.187436, 24.926664], [34.011915, 25.478721], [33.748752, 26.306431], [33.328, 27.6298], [33.219565, 27.927542], [33.115811, 28.212434], [32.863395, 28.905525], [32.316071, 30.408377], [31.7, 32.1], [31.298117, 32.387159], [30.945814, 32.306671], [30.318359, 32.382202], [30.213982, 32.557983], [29.7, 32.6], [27.9, 33.75], [27.0, 34.5], [23.6, 37.0], [20.75, 38.9], [16.3, 41.2], [15.0, 42.0], [12.7, 43.3], [12.40439, 43.746586], [12.0, 45.0], [13.0, 51.0], [14.030876, 54.187058], [14.6921, 56.2313], [15.644932, 59.44496], [16.2661, 61.54], [16.551398, 62.6071], [17.128701, 64.766386], [17.527476, 66.257926], [17.707, 66.9294], [17.911613, 67.795105], [18.43269, 69.999749], [19.0, 72.4], [18.941361, 72.80777]
];

// ─────────────────────────────────────────────────────────────────────────────
// PORTS — Origins (Russia, Iraq, UAE, USA) and Destinations (India)
// ─────────────────────────────────────────────────────────────────────────────
export const PORTS: Port[] = [
  { id: 'port-kochi', name: 'Kochi Port', country: 'India', position: [9.9687, 76.2393], congestionPct: 68, vesselsWaiting: 5, avgWaitHours: 22, jettyOccupancyPct: 81, isBpclHub: true },
  { id: 'port-mumbai-jnpt', name: 'Mumbai Port / JNPT', country: 'India', position: [18.9433, 72.9486], congestionPct: 84, vesselsWaiting: 9, avgWaitHours: 38, jettyOccupancyPct: 92, isBpclHub: true },
  { id: 'port-sikka', name: 'Jamnagar / Sikka', country: 'India', position: [22.4236, 69.8062], congestionPct: 47, vesselsWaiting: 3, avgWaitHours: 11, jettyOccupancyPct: 59, isBpclHub: false },
  { id: 'port-fujairah', name: 'Fujairah', country: 'UAE', position: [25.1749, 56.3587], congestionPct: 58, vesselsWaiting: 12, avgWaitHours: 24, jettyOccupancyPct: 73, isBpclHub: false },
  { id: 'port-basrah', name: 'Basrah / Al Basrah Oil Terminal', country: 'Iraq', position: [29.7950, 48.8150], congestionPct: 45, vesselsWaiting: 6, avgWaitHours: 14, jettyOccupancyPct: 65, isBpclHub: false },
  { id: 'port-novorossiysk', name: 'Novorossiysk', country: 'Russia', position: [44.7243, 37.7675], congestionPct: 32, vesselsWaiting: 3, avgWaitHours: 10, jettyOccupancyPct: 45, isBpclHub: false },
  { id: 'port-houston', name: 'Houston / Galveston', country: 'USA', position: [29.3013, -94.7977], congestionPct: 42, vesselsWaiting: 6, avgWaitHours: 15, jettyOccupancyPct: 60, isBpclHub: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// VESSELS  –  positions are exact backend interpolations at given progress_pct
// ─────────────────────────────────────────────────────────────────────────────
export const VESSELS: Vessel[] = [
  {
    // ── MT Volgograd ── VLCC, Russia → Sikka, 85 % through
    id: 'v-volgograd',
    name: 'MT Volgograd',
    imo: '9827311',
    mmsi: '419001234',
    flag: 'RU',
    type: 'VLCC',
    dwt: 318000,
    gt: 162000,
    nt: 105000,
    length: 333,
    isBpcl: false,
    ownership: 'Chartered',
    status: 'onTrack',
    speedKnots: 12.6,
    headingDeg: 82.4,
    position: [18.22, 59.04], // updated to match backend [18.2223, 59.0372]
    origin: 'Novorossiysk',
    destination: 'Sikka',
    destinationCoords: [22.4236, 69.8062],
    etaUtc: '2026-04-30T17:00:00Z',
    etaIst: '2026-04-30T22:30:00Z',
    riskScore: 24,
    delayProbability: 15,
    routeId: 'route-russia-sikka',
    routeCode: 'R001',
    pastRoute: R001.slice(0, 8).concat([[18.22, 59.04]]),
    currentRoute: [ [18.22, 59.04], [22.42, 69.80] ],
    recommendedRoute: [[18.22, 59.04], [20.0838, 64.5005], [20.0761, 65.0053], [20.0, 70.0], [19.0, 72.4], [18.9433, 72.9486]],
    cargoType: 'Urals Crude',
    cargoVolumeBbl: 2150000,
    vesselDailyRate: 48000,
    confidence: 94,
    routeLengthNm: 4200,
    lastUpdateMin: 2,
  },
  {
    // ── MT Basrah Star ── Suezmax, Basrah → Mumbai, 40 % through
    id: 'v-basrah-star',
    name: 'MT Basrah Star',
    imo: '9764328',
    mmsi: '419005678',
    flag: 'IQ',
    type: 'Suezmax',
    dwt: 158000,
    gt: 81000,
    nt: 52000,
    length: 274,
    isBpcl: true,
    ownership: 'BPCL',
    status: 'delayed',
    speedKnots: 10.8,
    headingDeg: 135.0,
    position: [26.25, 54.8], // interpolated at 40 %
    origin: 'Basrah',
    destination: 'Mumbai',
    destinationCoords: [18.9433, 72.9486],
    etaUtc: '2026-05-04T10:00:00Z',
    etaIst: '2026-05-04T15:30:00Z',
    riskScore: 62,
    delayProbability: 58,
    routeId: 'route-basrah-mumbai',
    routeCode: 'R002',
    pastRoute: R002.slice(0, 5).concat([[26.25, 54.8]]),
    currentRoute: [ [26.25, 54.8], [26.4, 56.4], [25.5, 57.1], [18.94, 72.80] ],
    recommendedRoute: R002,
    cargoType: 'Basrah Medium',
    cargoVolumeBbl: 980000,
    vesselDailyRate: 32000,
    confidence: 88,
    routeLengthNm: 1572,
    lastUpdateMin: 5,
  },
  {
    // ── MT Fujairah King ── Aframax, UAE → Kochi, 65 % through
    id: 'v-fujairah-king',
    name: 'MT Fujairah King',
    imo: '9652431',
    mmsi: '419009999',
    flag: 'AE',
    type: 'Aframax',
    dwt: 112000,
    gt: 64000,
    nt: 40200,
    length: 246,
    isBpcl: true,
    ownership: 'BPCL',
    status: 'highRisk',
    speedKnots: 13.9,
    headingDeg: 145.2,
    position: [15.6, 67.5], // interpolated at 65 %
    origin: 'Fujairah',
    destination: 'Kochi',
    destinationCoords: [9.9687, 76.2393],
    etaUtc: '2026-05-02T06:00:00Z',
    etaIst: '2026-05-02T11:30:00Z',
    riskScore: 78,
    delayProbability: 64,
    routeId: 'route-fujairah-kochi',
    routeCode: 'R003',
    pastRoute: R003.slice(0, 5).concat([[15.6, 67.5]]),
    currentRoute: [ [15.6, 67.5], [13.7, 69.9], [9.96, 76.23] ],
    recommendedRoute: R003,
    cargoType: 'Murban Crude',
    cargoVolumeBbl: 720000,
    vesselDailyRate: 24000,
    confidence: 82,
    routeLengthNm: 1250,
    lastUpdateMin: 3,
  },
  {
    // ── MT Houston Voyager ── VLCC, USA → Mumbai, 92 % through
    id: 'v-houston-voyager',
    name: 'MT Houston Voyager',
    imo: '9542180',
    mmsi: '419002222',
    flag: 'US',
    type: 'VLCC',
    dwt: 302000,
    gt: 156000,
    nt: 98000,
    length: 330,
    isBpcl: false,
    ownership: 'Chartered',
    status: 'critical',
    speedKnots: 14.2,
    headingDeg: 42.6,
    position: [17.5, 72.3], // interpolated at 92 %
    origin: 'Houston',
    destination: 'Mumbai',
    destinationCoords: [18.9433, 72.9486],
    etaUtc: '2026-04-29T08:00:00Z',
    etaIst: '2026-04-29T13:30:00Z',
    riskScore: 91,
    delayProbability: 79,
    routeId: 'route-usa-mumbai',
    routeCode: 'R004',
    pastRoute: R004.slice(0, 130).concat([[17.5, 72.3]]),
    currentRoute: [ [17.5, 72.3], [18.94, 72.80] ],
    recommendedRoute: [[17.5, 72.3], [14.0, 73.5], [12.0, 75.0], [9.96, 76.23]],
    cargoType: 'WTI Midland',
    cargoVolumeBbl: 2050000,
    vesselDailyRate: 52000,
    confidence: 91,
    routeLengthNm: 11200,
    lastUpdateMin: 1,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RISK ZONES
// ─────────────────────────────────────────────────────────────────────────────
export const RISK_ZONES: RiskZone[] = [
  {
    id: 'rz-hormuz',
    name: 'Strait of Hormuz',
    type: 'geopolitical',
    severity: 'critical',
    polygon: [[26.55, 55.45], [26.85, 56.10], [26.70, 57.05], [26.20, 57.35], [25.65, 56.90], [25.55, 55.95], [26.00, 55.35]],
    description: 'Energy chokepoint with elevated security advisories and insurance shocks.',
    vesselsAffected: 4,
  },
  {
    id: 'rz-aden',
    name: 'Gulf of Aden',
    type: 'piracy',
    severity: 'high',
    polygon: [[14.75, 43.00], [15.00, 48.50], [13.50, 51.80], [11.80, 50.80], [11.50, 45.00], [12.50, 42.80]],
    description: 'Security corridor requiring convoy monitoring and insurance watch.',
    vesselsAffected: 1,
  },
  {
    id: 'rz-suez',
    name: 'Suez Canal',
    type: 'congestion',
    severity: 'medium',
    polygon: [[31.20, 32.05], [30.95, 32.50], [30.30, 32.55], [29.90, 32.20], [30.10, 31.95], [30.80, 31.95]],
    description: 'Canal and anchorage delay zone affecting Europe-India arrivals.',
    vesselsAffected: 0,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RAE PINS  (historical match overlays)
// ─────────────────────────────────────────────────────────────────────────────
export const RAE_PINS: RaePin[] = [
  {
    id: 'rae-1',
    position: [26.2, 56.3],
    title: '2024 Hormuz Blockage Incident',
    match: 94,
    date: 'Mar 18, 2024',
    summary: 'Two-day transit restriction. Mean delay on India-bound VLCCs: 38h. Demurrage exposure $2.1M/vessel.',
  },
  {
    id: 'rae-2',
    position: [12.6, 47.8],
    title: '2023 Gulf of Aden Hijacking',
    match: 78,
    date: 'Nov 04, 2023',
    summary: 'Armed boarding attempt. Nearby vessels rerouted via southern arc adding ~1,100 nm.',
  },
  {
    id: 'rae-3',
    position: [21.5, 69.2],
    title: 'Cyclone Tauktae 2021 Impact',
    match: 72,
    date: 'May 17, 2021',
    summary: 'Western port closures for 48h. Jetty draft changes noted. MT Bharat experienced 52h idle wait.',
  },
  {
    id: 'rae-4',
    position: [29.9, 32.5],
    title: 'Suez Canal Obstruction (Ever Given)',
    match: 91,
    date: 'Mar 23, 2021',
    summary: 'Total transit halt for 6 days. Global supply chain shock. Demurrage backlog cleared in 3 weeks.',
  },
];
