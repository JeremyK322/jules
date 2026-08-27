// moonLayers.js
// Comprehensive Moon Viewer data - natural lunar surface features, historical/recent landing sites, and active orbits
// Updated with OST Article VI State Responsibility data model & legal mechanism governance fields

export const STATE_DEFS = {
  USA: {
    name: 'United States',
    color: '#2b82c9',
    flag: '🇺🇸',
    note: 'Article VI national responsibility for state (NASA) and commercial authorized entities (CLPS).'
  },
  USSR: {
    name: 'USSR (Historical)',
    color: '#cc0000',
    flag: '🛠️',
    note: 'Historical Article VI state responsibility (1959–1991 Soviet lunar program).'
  },
  Russia: {
    name: 'Russian Federation',
    color: '#e63946',
    flag: '🇷🇺',
    note: 'Post-1991 Article VI state responsibility (Roscosmos).'
  },
  China: {
    name: 'China (CNSA)',
    color: '#ffb703',
    flag: '🇨🇳',
    note: 'Article VI national responsibility for state agencies (CNSA / CLEP).'
  },
  India: {
    name: 'India (ISRO)',
    color: '#fb8500',
    flag: '🇮🇳',
    note: 'Article VI national responsibility for state agency (ISRO).'
  },
  Japan: {
    name: 'Japan (JAXA / Commercial)',
    color: '#ff4d6d',
    flag: '🇯🇵',
    note: 'Article VI national responsibility for state (JAXA) and private licensed operators (ispace).'
  },
  SouthKorea: {
    name: 'South Korea (KARI)',
    color: '#00a896',
    flag: '🇰🇷',
    note: 'Article VI national responsibility for state agency (KARI).'
  },
  ESA: {
    name: 'ESA (Member States)',
    color: '#00b4d8',
    flag: '🇪🇺',
    note: 'Intergovernmental organization. Responsibility shared by ESA and member states under Article VI and Article XIII.'
  },
  Israel: {
    name: 'Israel',
    color: '#48cae4',
    flag: '🇮🇱',
    note: 'Article VI national authorization and continuing supervision for non-governmental entity (SpaceIL).'
  },
  Pakistan: {
    name: 'Pakistan (SUPARCO)',
    color: '#2a9d8f',
    flag: '🇵🇰',
    note: 'Article VI national responsibility for payload operator SUPARCO (joint mission with CNSA).'
  }
};

export const FEATURES = [
  // ============================================================
  // PHYSICAL FEATURES - Maria / Seas (state: null -> Article II Non-Appropriation)
  // ============================================================
  { id: 'mare_tranquillitatis', name: 'Mare Tranquillitatis', lat: 8.5, lon: 31.4, radius_km: 437, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Basaltic mare plain formed during Upper Imbrian epoch.' },
  { id: 'mare_imbrium', name: 'Mare Imbrium', lat: 32.8, lon: -15.6, radius_km: 570, tier: 3, tags: ['maria', 'helium3'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Vast impact basin filled with flooded mare basalt.' },
  { id: 'mare_serenitatis', name: 'Mare Serenitatis', lat: 28.0, lon: 17.5, radius_km: 374, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Circular lunar mare located within Serenitatis basin.' },
  { id: 'mare_crisium', name: 'Mare Crisium', lat: 17.0, lon: 59.1, radius_km: 281, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Isolated lunar mare located in Crisium basin.' },
  { id: 'oceanus_procellarum', name: 'Oceanus Procellarum', lat: 18.4, lon: -57.4, radius_km: 1200, tier: 3, tags: ['maria', 'helium3'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Largest lunar mare region on the western edge of near side.' },
  { id: 'mare_orientale', name: 'Mare Orientale', lat: -19.4, lon: -92.8, radius_km: 164, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Target basin with concentric multiring scarp system.' },
  { id: 'mare_nectaris', name: 'Mare Nectaris', lat: -15.2, lon: 35.5, radius_km: 167, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Small lunar mare forming central part of Nectaris basin.' },
  { id: 'mare_humorum', name: 'Mare Humorum', lat: -24.4, lon: -38.6, radius_km: 195, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Circular mare basin encircled by concentric arcuate rilles.' },
  { id: 'mare_moscoviense', name: 'Mare Moscoviense (Far Side)', lat: 27.3, lon: 147.9, radius_km: 138, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'One of the few mare regions situated on the lunar far side.' },
  { id: 'mare_ingenii', name: 'Mare Ingenii (Far Side)', lat: -33.7, lon: 163.5, radius_km: 159, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Far side mare basin displaying high lunar swirl albedo features.' },
  { id: 'mare_frigoris', name: 'Mare Frigoris (Sea of Cold)', lat: 56.0, lon: 1.4, radius_km: 450, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Elongated mare located north of Mare Imbrium.' },
  { id: 'mare_fecunditatis', name: 'Mare Fecunditatis (Sea of Fertility)', lat: -7.8, lon: 51.3, radius_km: 500, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Broad low-relief mare basin in eastern near side quadrant.' },
  { id: 'sinus_iridum', name: 'Sinus Iridum (Bay of Rainbows)', lat: 44.1, lon: -31.5, radius_km: 236, tier: 3, tags: ['maria'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Basaltic plain forming a bay on northwestern Mare Imbrium.' },

  // ============================================================
  // PHYSICAL FEATURES - Major Craters (state: null)
  // ============================================================
  { id: 'tycho', name: 'Tycho Crater', lat: -43.3, lon: -11.2, radius_km: 85, tier: 3, tags: ['craters', 'geology'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Prominent young impact crater with high-albedo ray system.' },
  { id: 'copernicus', name: 'Copernicus Crater', lat: 9.6, lon: -20.1, radius_km: 93, tier: 3, tags: ['craters', 'geology'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Terraced crater wall displaying central peak complex.' },
  { id: 'aristarchus', name: 'Aristarchus Crater', lat: 23.7, lon: -47.4, radius_km: 40, tier: 2, tags: ['craters', 'geology', 'science_interest'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Exceptionally bright impact structure on elevated plateau.' },
  { id: 'plato', name: 'Plato Crater', lat: 51.6, lon: -9.3, radius_km: 101, tier: 3, tags: ['craters'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Smooth dark basaltic floor surrounded by jagged rim peaks.' },
  { id: 'clavius', name: 'Clavius Crater', lat: -58.4, lon: -14.4, radius_km: 225, tier: 3, tags: ['craters'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Ancient degraded crater basin in southern lunar highlands.' },
  { id: 'kepler', name: 'Kepler Crater', lat: 8.1, lon: -38.0, radius_km: 31, tier: 3, tags: ['craters'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Rayed impact crater situated between Oceanus Procellarum and Mare Insularum.' },
  { id: 'archimedes', name: 'Archimedes Crater', lat: 29.7, lon: -4.0, radius_km: 83, tier: 3, tags: ['craters'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Flooded flat-floored impact crater in eastern Mare Imbrium.' },
  { id: 'tsiolkovskiy', name: 'Tsiolkovskiy Crater (Far Side)', lat: -20.4, lon: 129.1, radius_km: 185, tier: 2, tags: ['craters', 'science_interest'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Far side crater featuring dark basalt floor and high central peak.' },
  { id: 'jackson', name: 'Jackson Crater (Far Side)', lat: 22.1, lon: -163.3, radius_km: 71, tier: 3, tags: ['craters'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Far side impact crater with prominent bright ray structure.' },
  { id: 'korolev', name: 'Korolev Basin/Crater (Far Side)', lat: -4.0, lon: -157.4, radius_km: 437, tier: 3, tags: ['craters', 'basins'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Large deep far side impact basin.' },

  // ============================================================
  // PHYSICAL FEATURES - Mountains, Basins, Valleys & Scarps (state: null)
  // ============================================================
  { id: 'montes_apenninus', name: 'Montes Apenninus', lat: 18.9, lon: 3.7, radius_km: 300, tier: 3, tags: ['mountains', 'geology'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Rugged mountain range forming southeastern boundary of Mare Imbrium.' },
  { id: 'montes_caucasus', name: 'Montes Caucasus', lat: 38.4, lon: 10.0, radius_km: 260, tier: 3, tags: ['mountains'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Highland mountain wall separating Mare Imbrium and Mare Serenitatis.' },
  { id: 'montes_alpes', name: 'Montes Alpes', lat: 46.4, lon: -0.8, radius_km: 180, tier: 3, tags: ['mountains'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Northern mountain range intersected by Vallis Alpes.' },
  { id: 'spa_basin', name: 'South Pole-Aitken Basin', lat: -53.0, lon: -169.0, radius_km: 1250, tier: 2, tags: ['basins', 'science_interest', 'data_value'], state: null, source: 'LRO LOLA / GRAIL Gravity Data', note: 'Largest and oldest recognized impact basin on the Moon.' },
  { id: 'mons_huygens', name: 'Mons Huygens (Major Massif)', lat: 19.9, lon: -2.9, radius_km: 15, tier: 3, tags: ['mountains', 'geology'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Tallest mountain peak massif within Montes Apenninus.' },
  { id: 'hadley_rille', name: 'Hadley Rille (Apollo 15 site)', lat: 25.8, lon: 3.2, radius_km: 40, tier: 3, tags: ['valles', 'geology'], state: null, source: 'Apollo 15 Geological Mapping', note: 'Sinuous volcanic rille along edge of Montes Apenninus.' },
  { id: 'rupes_recta', name: 'Rupes Recta (Straight Wall)', lat: -22.1, lon: -7.8, radius_km: 50, tier: 3, tags: ['valles', 'geology'], state: null, source: 'IAU Gazetteer of Planetary Nomenclature', note: 'Linear fault scarp in eastern Mare Nubium.' },

  // ============================================================
  // SPATIAL - Soft Landings (Crewed Apollo) - Tier 1 Heritage
  // ============================================================
  { id: 'apollo_11', name: 'Apollo 11 (Tranquility Base)', lat: 0.674, lon: 23.473, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage', 'political', 'crewed'], source: 'NASA Apollo Mission Report', note: 'Heritage value per international recognition; no binding legal designation to date.' },
  { id: 'apollo_12', name: 'Apollo 12', lat: -3.013, lon: -23.422, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage', 'crewed'], source: 'NASA Apollo Mission Report', note: 'Heritage value per international recognition; no binding legal designation to date.' },
  { id: 'apollo_14', name: 'Apollo 14', lat: -3.645, lon: -17.472, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage', 'crewed'], source: 'NASA Apollo Mission Report', note: 'Heritage value per international recognition; no binding legal designation to date.' },
  { id: 'apollo_15', name: 'Apollo 15 (Hadley-Apennine)', lat: 26.132, lon: 3.633, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage', 'crewed'], source: 'NASA Apollo Mission Report', note: 'Heritage value per international recognition; no binding legal designation to date.' },
  { id: 'apollo_16', name: 'Apollo 16 (Descartes)', lat: -8.973, lon: 15.500, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage', 'crewed'], source: 'NASA Apollo Mission Report', note: 'Heritage value per international recognition; no binding legal designation to date.' },
  { id: 'apollo_17', name: 'Apollo 17 (Taurus-Littrow)', lat: 20.191, lon: 30.772, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage', 'crewed'], source: 'NASA Apollo Mission Report', note: 'Heritage value per international recognition; no binding legal designation to date.' },

  // ============================================================
  // SPATIAL - Soft Landings (Robotic Historic & Recent)
  // ============================================================
  { id: 'luna_9', name: 'Luna 9 (first soft landing)', lat: 7.08, lon: -64.37, radius_km: 10, tier: 1, owner: 'Soviet Space Program', state: 'USSR', articles: [6, 9], tags: ['landing', 'heritage'], source: 'Soviet Space Program Documentation', note: 'First robotic soft landing on extraterrestrial body.' },
  { id: 'luna_13', name: 'Luna 13', lat: 18.87, lon: -62.05, radius_km: 10, tier: 1, owner: 'Soviet Space Program', state: 'USSR', articles: [6, 9], tags: ['landing', 'heritage'], source: 'Soviet Space Program Documentation', note: 'Robotic lander with soil density penetrometer.' },
  { id: 'surveyor_1', name: 'Surveyor 1', lat: -2.47, lon: -43.34, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage'], source: 'NASA JPL Surveyor Documentation', note: 'First operational US soft lunar landing.' },
  { id: 'surveyor_3', name: 'Surveyor 3', lat: -3.016, lon: -23.418, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage'], source: 'NASA JPL Surveyor Documentation', note: 'Lander visited by Apollo 12 astronaut crew.' },
  { id: 'surveyor_5', name: 'Surveyor 5', lat: 1.455, lon: 23.194, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage'], source: 'NASA JPL Surveyor Documentation', note: 'Provided alpha-scattering chemical analysis of regolith.' },
  { id: 'surveyor_6', name: 'Surveyor 6', lat: 0.474, lon: -1.427, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage'], source: 'NASA JPL Surveyor Documentation', note: 'First spacecraft to perform a hop off lunar surface.' },
  { id: 'surveyor_7', name: 'Surveyor 7', lat: -40.981, lon: -11.513, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['landing', 'heritage'], source: 'NASA JPL Surveyor Documentation', note: 'Landed near Tycho crater rim highlands.' },
  { id: 'luna_16', name: 'Luna 16', lat: -0.51, lon: 56.36, radius_km: 10, tier: 1, owner: 'Soviet Space Program', state: 'USSR', articles: [6, 9], tags: ['landing', 'heritage'], source: 'Soviet Academy of Sciences Record', note: 'First automated sample return mission.' },
  { id: 'luna_17', name: 'Luna 17 / Lunokhod 1', lat: 38.24, lon: -35.00, radius_km: 10, tier: 1, owner: 'Soviet Space Program', state: 'USSR', articles: [6, 9], tags: ['landing', 'heritage'], source: 'Soviet Academy of Sciences Record', note: 'Carried first remote-controlled robotic lunar rover.' },
  { id: 'luna_20', name: 'Luna 20', lat: 3.79, lon: 56.62, radius_km: 10, tier: 1, owner: 'Soviet Space Program', state: 'USSR', articles: [6, 9], tags: ['landing', 'heritage'], source: 'Soviet Academy of Sciences Record', note: 'Robotic highland sample return spacecraft.' },
  { id: 'luna_21', name: 'Luna 21 / Lunokhod 2', lat: 25.85, lon: 30.45, radius_km: 10, tier: 1, owner: 'Soviet Space Program', state: 'USSR', articles: [6, 9], tags: ['landing', 'heritage'], source: 'Soviet Academy of Sciences Record', note: 'Rover traversed Le Monnier crater basin.' },
  { id: 'luna_24', name: 'Luna 24', lat: 12.71, lon: 62.21, radius_km: 10, tier: 1, owner: 'Soviet Space Program', state: 'USSR', articles: [6, 9], tags: ['landing', 'heritage'], source: 'Soviet Academy of Sciences Record', note: 'Final Luna program deep regolith core sample return.' },
  { id: 'change_3', name: "Chang'e 3 / Yutu", lat: 44.12, lon: -19.51, radius_km: 10, tier: 1, owner: 'CNSA', state: 'China', articles: [6, 9], tags: ['landing', 'heritage'], source: 'CNSA Official Mission Briefing', note: 'First modern soft landing and rover deployment in Mare Imbrium.' },
  { id: 'change_4', name: "Chang'e 4 / Yutu-2 (Far Side)", lat: -45.46, lon: 177.59, radius_km: 10, tier: 1, owner: 'CNSA', state: 'China', articles: [6, 9], tags: ['landing', 'heritage', 'political'], source: 'CNSA Official Mission Briefing', note: 'First soft landing on lunar far side inside Von Kármán crater.' },
  { id: 'change_5', name: "Chang'e 5", lat: 43.06, lon: -51.92, radius_km: 10, tier: 1, owner: 'CNSA', state: 'China', articles: [6, 9], tags: ['landing', 'heritage'], source: 'CNSA Official Mission Briefing', note: 'Automated sample return mission from Northern Oceanus Procellarum.' },
  { id: 'blue_ghost_1', name: 'Blue Ghost Mission 1 (Firefly)', lat: 18.56, lon: 61.81, radius_km: 10, tier: 2, owner: 'Firefly Aerospace / NASA CLPS', state: 'USA', articles: [6, 9], private: true, tags: ['landing', 'heritage'], source: 'NASA CLPS Program Office', note: 'Commercial lunar payload lander mission in Mare Crisium.' },
  { id: 'chandrayaan3', name: 'Chandrayaan-3 / Vikram', lat: -69.37, lon: 32.32, radius_km: 10, tier: 1, owner: 'ISRO', state: 'India', articles: [6, 9], tags: ['landing', 'heritage', 'political'], source: 'ISRO Mission Control Statement', note: 'First successful soft landing in high southern latitude region.' },
  { id: 'slim', name: 'SLIM (Japan)', lat: -13.32, lon: 25.25, radius_km: 10, tier: 1, owner: 'JAXA', state: 'Japan', articles: [6, 9], tags: ['landing', 'heritage'], source: 'JAXA Press Release', note: 'Pinpoint precision lunar landing technology demonstrator.' },
  { id: 'im1_odysseus', name: 'IM-1 Odysseus', lat: -80.13, lon: 1.44, radius_km: 10, tier: 2, owner: 'Intuitive Machines / NASA CLPS', state: 'USA', articles: [6, 9], private: true, tags: ['landing', 'heritage'], source: 'NASA CLPS Press Documentation', note: 'First commercial soft landing on high southern crater rim.' },
  { id: 'im2_athena', name: 'IM-2 Athena', lat: -84.79, lon: 29.20, radius_km: 10, tier: 2, owner: 'Intuitive Machines / NASA CLPS', state: 'USA', articles: [6, 9], private: true, tags: ['landing', 'heritage'], source: 'NASA CLPS Press Documentation', note: 'Commercial polar lander mission targeted near Shackleton.' },
  { id: 'change_6', name: "Chang'e 6 (Far Side sample)", lat: -41.64, lon: -153.99, radius_km: 10, tier: 1, owner: 'CNSA', state: 'China', articles: [6, 9], tags: ['landing', 'heritage', 'political'], source: 'CNSA Official Mission Briefing', note: 'First lunar far side sample return mission from SPA basin.' },

  // ============================================================
  // SPATIAL - Major Impacts
  // ============================================================
  { id: 'luna_2', name: 'Luna 2 (first impact)', lat: 29.1, lon: 0.0, radius_km: 10, tier: 1, owner: 'Soviet Space Program', state: 'USSR', articles: [6, 9], tags: ['impact', 'heritage', 'political'], source: 'Soviet Academy of Sciences Record', note: 'First human-made object to contact lunar surface.' },
  { id: 'ranger_7', name: 'Ranger 7', lat: -10.63, lon: -20.68, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['impact', 'heritage'], source: 'NASA Mission History', note: 'Transmitted high-resolution close-up TV images prior to surface impact.' },
  { id: 'lcross', name: 'LCROSS (Cabeus)', lat: -84.72, lon: -49.36, radius_km: 10, tier: 2, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['impact', 'water_ice', 'science_interest'], source: 'NASA LCROSS Mission Data', note: 'Controlled impact revealing volatile water plume signature.' },
  { id: 'chandrayaan2_crash', name: 'Chandrayaan-2 Vikram crash', lat: -70.88, lon: 22.78, radius_km: 10, tier: 2, owner: 'ISRO', state: 'India', articles: [6, 9], tags: ['impact'], source: 'ISRO Public Report', note: 'Lander hard impact debris location confirmed by LRO imagery.' },
  { id: 'luna_25_crash', name: 'Luna 25 crash', lat: -69.55, lon: 61.4, radius_km: 10, tier: 2, owner: 'Roscosmos', state: 'Russia', articles: [6, 9], tags: ['impact'], source: 'Roscosmos Press Release', note: 'Impact site resulting from off-nominal deorbit burn.' },
  { id: 'hakuto_r_crash', name: 'Hakuto-R M1 crash', lat: 47.58, lon: 44.09, radius_km: 10, tier: 2, owner: 'ispace / JAXA', state: 'Japan', articles: [6, 9], private: true, tags: ['impact'], source: 'ispace Flight Evaluation Report', note: 'Commercial lander hard impact on Mare Frigoris.' },
  { id: 'hakuto_r_m2', name: 'Hakuto-R M2 Resilience crash', lat: 60.44, lon: -4.59, radius_km: 10, tier: 2, owner: 'ispace / JAXA', state: 'Japan', articles: [6, 9], private: true, tags: ['impact'], source: 'ispace Flight Evaluation Report', note: 'Commercial lunar mission impact coordinates.' },
  { id: 'peregrine_impact', name: 'Peregrine Mission 1', lat: 35.2, lon: -30.5, radius_km: 10, tier: 2, owner: 'Astrobotic / NASA CLPS', state: 'USA', articles: [6, 9], private: true, tags: ['impact'], source: 'Astrobotic Flight Operations', note: 'Payload mission telemetry impact trajectory.' },
  { id: 'beresheet', name: 'Beresheet (Israel, 2019 crash)', lat: 32.6, lon: -19.5, radius_km: 10, tier: 2, owner: 'SpaceIL / IAI', state: 'Israel', articles: [6, 9], private: true, tags: ['impact', 'heritage'], source: 'SpaceIL Mission Analysis', note: 'First privately funded lunar lander impact site in Mare Serenitatis.' },
  { id: 'smart_1', name: 'SMART-1 (ESA, 2006 intentional impact)', lat: 34.2, lon: -46.2, radius_km: 10, tier: 1, owner: 'ESA', state: 'ESA', articles: [6, 9], tags: ['impact', 'heritage'], source: 'ESA Science Operations', note: 'Controlled end-of-mission impact observed by Earth-based telescopes.' },
  { id: 'grail_ebb_flow', name: 'GRAIL (Ebb & Flow, 2012 impact)', lat: 75.6, lon: -26.4, radius_km: 10, tier: 1, owner: 'NASA', state: 'USA', articles: [6, 9], tags: ['impact', 'heritage'], source: 'NASA GRAIL Operations', note: 'Intentional mission end impacts near Sally Ride crater.' },
  { id: 'chandrayaan1_mip', name: 'Chandrayaan-1 MIP (2008 impact)', lat: -89.76, lon: 39.0, radius_km: 10, tier: 1, owner: 'ISRO', state: 'India', articles: [6, 9], tags: ['impact', 'heritage'], source: 'ISRO Mission Report', note: 'Moon Impact Probe intentional hard landing near South Pole.' },

  // ============================================================
  // EXTRACTABLE - Water Ice / PSRs (state: null)
  // ============================================================
  { id: 'shackleton', name: 'Shackleton Crater', lat: -89.67, lon: 129.78, radius_km: 21, tier: 1, owner: null, state: null, articles: [9], tags: ['water_ice', 'psr', 'science_interest', 'sensitive'], source: 'LRO LOLA / Mini-RF Spectral Data', note: 'Candidate SESI per CRP.14.' },
  { id: 'cabeus', name: 'Cabeus Crater', lat: -85.33, lon: -42.13, radius_km: 50, tier: 1, owner: null, state: null, articles: [9], tags: ['water_ice', 'psr', 'science_interest', 'sensitive'], source: 'LCROSS Impact Spectroscopy', note: 'Candidate SESI per CRP.14.' },
  { id: 'shoemaker', name: 'Shoemaker Crater', lat: -88.14, lon: 45.91, radius_km: 26, tier: 1, owner: null, state: null, articles: [9], tags: ['water_ice', 'psr', 'science_interest', 'sensitive'], source: 'LRO LAMP / LCROSS Observations', note: 'Candidate SESI per CRP.14.' },
  { id: 'haworth', name: 'Haworth Crater', lat: -86.9, lon: -4.0, radius_km: 26, tier: 1, owner: null, state: null, articles: [9], tags: ['water_ice', 'psr', 'science_interest', 'sensitive'], source: 'LRO LOLA Albedo Mapping', note: 'Candidate SESI per CRP.14.' },

  // ============================================================
  // EXTRACTABLE - Mineral / Metal Regions (state: null)
  // ============================================================
  { id: 'mineral_tranq', name: 'Mare Tranquillitatis ilmenite-rich basalts', lat: 8.5, lon: 31.4, radius_km: 220, tier: 2, owner: null, state: null, source: 'Clementine UVVIS spectral data', note: 'High TiO2 basalt enrichment identified via multispectral imagery.' },
  { id: 'mineral_proc', name: 'Oceanus Procellarum Ti-rich basalts', lat: 18.4, lon: -57.4, radius_km: 260, tier: 2, owner: null, state: null, source: 'Clementine UVVIS spectral data', note: 'Extensive titanium and thorium elemental anomalies.' },
  { id: 'mineral_imbrium', name: 'Mare Imbrium Ti-rich basalts', lat: 32.8, lon: -15.6, radius_km: 240, tier: 2, owner: null, state: null, source: 'Clementine UVVIS spectral data', note: 'Basalt flows enriched in ilmenite and opaque oxides.' },
  { id: 'mineral_seren', name: 'Mare Serenitatis Ti-rich basalts', lat: 28.0, lon: 17.5, radius_km: 180, tier: 2, owner: null, state: null, source: 'Clementine UVVIS spectral data', note: 'High titanium content basalt flows along mare margin.' },
  { id: 'mineral_spa', name: 'South Pole-Aitken Basin Mg-suite anomalies', lat: -53.0, lon: -169.0, radius_km: 400, tier: 2, owner: null, state: null, source: 'Lunar Prospector / spectral observations', note: 'Exposed lower crustal and upper mantle magnesium-rich minerals.' },

  // ============================================================
  // ELECTROMAGNETIC / ENVIRONMENTAL - Radio Quiet Zone (state: null)
  // ============================================================
  {
    id: 'far_side_radio',
    name: 'Radio Quiet Zone (Far Side)',
    tags: ['radio_quiet', 'em_radio'],
    tier: 1,
    owner: null,
    state: null,
    articles: [9],
    source: 'ITU Radio Regulations, Article 22.22; OST Article IX',
    note: 'Protected spectrum zone for low-frequency radio astronomy free from terrestrial RFI.',
    geometry: {
      type: 'hemisphere',
      lat: 0,
      lon: 180,
      radius_km: 1737.4,
      opacity: 0.12
    }
  },

  // ============================================================
  // SPATIAL - Orbital Assets
  // ============================================================
  {
    id: 'lro_orbit',
    name: 'LRO (Lunar Reconnaissance Orbiter)',
    tags: ['orbits'],
    tier: 2,
    owner: 'NASA',
    state: 'USA',
    articles: [6, 9],
    source: 'NASA LRO Mission Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 50,
      inclination: 90,
      color: '#44aaff',
      has_satellite: true,
      satellite_name: 'LRO',
      speed: 0.25
    }
  },
  {
    id: 'danuri_orbit',
    name: 'Danuri / KPLO',
    tags: ['orbits'],
    tier: 2,
    owner: 'KARI',
    state: 'SouthKorea',
    articles: [6, 9],
    source: 'KARI Flight Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 100,
      inclination: 75,
      color: '#88ccff',
      has_satellite: true,
      satellite_name: 'Danuri',
      speed: 0.30
    }
  },
  {
    id: 'chandrayaan2_orbiter',
    name: 'Chandrayaan-2 Orbiter',
    tags: ['orbits'],
    tier: 2,
    owner: 'ISRO',
    state: 'India',
    articles: [6, 9],
    source: 'ISRO Flight Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 100,
      inclination: 88,
      color: '#aaddff',
      has_satellite: true,
      satellite_name: 'Chandrayaan-2',
      speed: 0.22
    }
  },
  {
    id: 'queqiao_l2',
    name: 'Queqiao Relay (L2 Halo)',
    tags: ['lagrange'],
    tier: 2,
    owner: 'CNSA',
    state: 'China',
    articles: [6, 9],
    source: 'CNSA Flight Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 3500,
      inclination: 30,
      dash: true,
      color: '#ff88cc',
      has_satellite: true,
      satellite_name: 'Queqiao',
      speed: 0.15
    }
  },
  {
    id: 'queqiao2_relay',
    name: 'Queqiao-2 Relay',
    tags: ['lagrange'],
    tier: 2,
    owner: 'CNSA',
    state: 'China',
    articles: [6, 9],
    source: 'CNSA Flight Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 2500,
      inclination: 55,
      dash: true,
      color: '#ff99dd',
      has_satellite: true,
      satellite_name: 'Queqiao-2',
      speed: 0.18
    }
  },
  {
    id: 'capstone_nrho',
    name: 'CAPSTONE (NRHO)',
    tags: ['lagrange'],
    tier: 2,
    owner: 'Advanced Space / NASA',
    state: 'USA',
    articles: [6, 9],
    private: true,
    source: 'NASA / Advanced Space Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 4000,
      inclination: 65,
      dash: true,
      color: '#ffaaee',
      has_satellite: true,
      satellite_name: 'CAPSTONE',
      speed: 0.20
    }
  },
  {
    id: 'artemis_p1',
    name: 'ARTEMIS P1 (NASA)',
    tags: ['orbits'],
    tier: 2,
    owner: 'NASA',
    state: 'USA',
    articles: [6, 9],
    source: 'NASA Mission Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 100,
      inclination: 83,
      color: '#66ccff',
      has_satellite: true,
      satellite_name: 'ARTEMIS-P1',
      speed: 0.28
    }
  },
  {
    id: 'artemis_p2',
    name: 'ARTEMIS P2 (NASA)',
    tags: ['orbits'],
    tier: 2,
    owner: 'NASA',
    state: 'USA',
    articles: [6, 9],
    source: 'NASA Mission Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 200,
      inclination: 68,
      color: '#77ddff',
      has_satellite: true,
      satellite_name: 'ARTEMIS-P2',
      speed: 0.26
    }
  },
  {
    id: 'lunar_trailblazer',
    name: 'Lunar Trailblazer (NASA)',
    tags: ['orbits', 'science_interest'],
    tier: 2,
    owner: 'NASA / Caltech',
    state: 'USA',
    articles: [6, 9],
    source: 'NASA / Caltech Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 100,
      inclination: 90,
      color: '#44ddbb',
      has_satellite: true,
      satellite_name: 'Trailblazer',
      speed: 0.24
    }
  },
  {
    id: 'icube_q',
    name: "ICUBE-Q (Pakistan / Chang'e 6 relay)",
    tags: ['orbits'],
    tier: 2,
    owner: 'SUPARCO / CNSA',
    state: 'Pakistan',
    articles: [6, 9],
    joint_states: ['Pakistan', 'China'],
    source: 'SUPARCO Mission Documentation',
    note: 'Mission documentation.',
    geometry: {
      type: 'orbit',
      radius_km: 1737.4 + 200,
      inclination: 55,
      dash: true,
      color: '#88dd88',
      has_satellite: true,
      satellite_name: 'ICUBE-Q',
      speed: 0.30
    }
  }
];

// ---- LAYER DEFINITIONS ----
export const LAYER_DEFS = {
  // Physical Features
  maria: {
    label: 'Maria & Lunar Seas',
    color: '#6688aa',
    tags: ['maria'],
    desc: 'Large dark basaltic plains formed by ancient volcanic eruptions'
  },
  craters: {
    label: 'Major Craters',
    color: '#aaccdd',
    tags: ['craters'],
    desc: 'Prominent impact craters across near and far sides'
  },
  mountains: {
    label: 'Mountain Ranges & Ridges',
    color: '#ddbbaa',
    tags: ['mountains'],
    desc: 'Major mountain ranges rimming ancient impact basins'
  },
  basins: {
    label: 'Basins & Formations',
    color: '#bbaacc',
    tags: ['basins'],
    desc: 'Large impact basins and regional geology'
  },
  valles: {
    label: 'Valleys & Rilles',
    color: '#ccaa88',
    tags: ['valles'],
    desc: 'Sinuous rilles and tectonic valleys'
  },

  // Extractable
  water_ice: {
    label: 'Water Ice (PSR)',
    color: '#4488ff',
    tags: ['water_ice'],
    desc: 'Permanently shadowed regions with confirmed or high-probability water ice'
  },
  helium3: {
    label: 'Helium-3 Regions',
    color: '#88ff88',
    tags: ['helium3'],
    desc: 'Solar-wind implanted 3He in mature high-titanium regolith'
  },
  minerals: {
    label: 'Mineral & Metal Regions',
    color: '#d4b64a',
    tags: ['minerals'],
    desc: 'Identified mineral concentrations (Clementine / Lunar Prospector)'
  },

  // Spatial
  landing: {
    label: 'Landing Sites',
    color: '#ff6644',
    tags: ['landing'],
    desc: 'Successful soft landings (crewed + robotic)'
  },
  launch_sites: {
    label: 'Launch Sites',
    color: '#ffaa33',
    tags: ['launch_sites'],
    desc: 'Future launch and ascent sites (empty placeholder)'
  },
  safety_zones: {
    label: 'Safety Zones',
    color: '#ff8833',
    tags: ['safety_zones'],
    desc: 'Operational exclusion areas around active sites (empty placeholder)'
  },
  impact: {
    label: 'Major Impacts',
    color: '#ff4422',
    tags: ['impact'],
    desc: 'Historically significant intentional or unintentional impacts'
  },
  orbits: {
    label: 'Low Lunar Orbits',
    color: '#88ccff',
    tags: ['orbits'],
    desc: 'Spacecraft in low lunar orbit'
  },
  lagrange: {
    label: 'Lagrange / Halo Orbits',
    color: '#ff88cc',
    tags: ['lagrange'],
    desc: 'L1/L2 halo and near-rectilinear halo orbit trajectories'
  },
  crewed: {
    label: 'Crewed Landings',
    color: '#ffcc44',
    tags: ['crewed'],
    desc: 'Apollo crewed landing locations'
  },

  // Environmental
  psr: {
    label: 'PSR (Fragile Environments)',
    color: '#44aaff',
    tags: ['psr'],
    desc: 'Permanently shadowed cold traps'
  },
  science_interest: {
    label: 'High Scientific Interest',
    color: '#44ffaa',
    tags: ['science_interest'],
    desc: 'High-priority targets for geological and physical research'
  },
  geology: {
    label: 'Unique Geology',
    color: '#ff8844',
    tags: ['geology'],
    desc: 'Volcanic features, ray systems, and rim structures'
  },
  radio_quiet: {
    label: 'Radio Quiet Zone',
    color: '#8844ff',
    tags: ['radio_quiet'],
    desc: 'Far-side electromagnetic radio quiet zone'
  },
  sensitive: {
    label: 'Contamination-Sensitive',
    color: '#ff4488',
    tags: ['sensitive'],
    desc: 'Pristine scientific environments requiring protection'
  },

  // Intangible
  heritage: {
    label: 'Heritage Sites',
    color: '#ff5555',
    tags: ['heritage'],
    desc: 'Historic spacecraft landing and impact locations'
  },
  political: {
    label: 'Political & Symbolic Sites',
    color: '#ff66aa',
    tags: ['political'],
    desc: 'Pioneering achievements and exploration focus areas'
  },
  data_value: {
    label: 'Scientific Data Value',
    color: '#66ccff',
    tags: ['data_value'],
    desc: 'Unmodified planetary records of high scientific value'
  },
  view_shed: {
    label: 'View-Shed',
    color: '#cc99ff',
    tags: ['view_shed'],
    desc: 'Cultural and scientific values of significant views (empty placeholder)'
  },

  // Electromagnetic
  em_radio: {
    label: 'EM / Radio Resource',
    color: '#aa55ee',
    tags: ['em_radio'],
    desc: 'Far side radio quiet zone as a spectrum asset'
  }
};

// ---- CATEGORIES (order defines layer priority) ----
export const CATEGORIES = {
  'Physical Features': ['maria', 'craters', 'mountains', 'basins', 'valles'],
  'Extractable': ['water_ice', 'helium3', 'minerals'],
  'Spatial': ['landing', 'launch_sites', 'safety_zones', 'impact', 'orbits', 'lagrange', 'crewed'],
  'Environmental': ['psr', 'science_interest', 'geology', 'radio_quiet', 'sensitive'],
  'Intangible': ['heritage', 'political', 'data_value', 'view_shed'],
  'Electromagnetic': ['em_radio']
};

// ---- TIER DEFINITIONS ----
export const TIER_DEFS = {
  1: { label: 'Protected', color: '#ff4444', desc: 'Activity prohibited or severely restricted' },
  2: { label: 'Coordination Required', color: '#ffaa44', desc: 'Activity permitted, coordination required to avoid interference' },
  3: { label: 'Open', color: '#44ff88', desc: 'Activity may proceed subject to general due regard' }
};
