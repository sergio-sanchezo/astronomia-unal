import Head from 'next/head';
import Layout from '@components/Layout';
import Map from '@components/Map';
import { useState } from 'react';

import styles from '@styles/Home.module.scss';

const DEFAULT_CENTER = [4.6371, -74.083254]; // Coordenadas de Bogotá

const SolarSystemMap = () => {
  const [earthDiameterCM, setEarthDiameterCM] = useState(22); // Diámetro de la Tierra en cm
  const [alignmentAngle, setAlignmentAngle] = useState(0); // Ángulo de alineación

  const planetData = [
    { name: 'Sol', diameterScale: 109, color: 'yellow', orbitalRadiusAU: 0 },
    { name: 'Mercurio', diameterScale: 0.39, color: 'red', orbitalRadiusAU: 0.39 },
    { name: 'Venus', diameterScale: 0.95, color: 'purple', orbitalRadiusAU: 0.72 },
    { name: 'Tierra', diameterScale: 1, color: 'blue', orbitalRadiusAU: 1 },
    { name: 'Luna', diameterScale: 0.27, color: 'gray', orbitalRadiusAU: 0.00257, orbitAround: 'Tierra' }, // Orbita alrededor de la Tierra
    { name: 'Marte', diameterScale: 0.53, color: 'orange', orbitalRadiusAU: 1.52 },
    { name: 'Júpiter', diameterScale: 11.2, color: 'brown', orbitalRadiusAU: 5.2 },
    { name: 'Saturno', diameterScale: 9.41, color: 'gold', orbitalRadiusAU: 9.54 },
    { name: 'Urano', diameterScale: 3.98, color: 'cyan', orbitalRadiusAU: 19.19 },
    { name: 'Neptuno', diameterScale: 3.81, color: 'darkblue', orbitalRadiusAU: 30.06 }
  ];

  const AUtoKM = 149597870.7; // 1 AU en kilómetros
  const earthDiameterKM = 12756; // Diámetro de la Tierra en kilómetros

  // Escalar el diámetro del planeta en metros (Leaflet utiliza metros)
  const scaleDiameterToMeters = (diameterScale) => {
    return (diameterScale * earthDiameterCM) / 100; // Convertir cm a metros
  };

  // Escalar las distancias orbitales sin factor de escala adicional
  const scaleOrbitalDistance = (orbitalRadiusAU) => {
    const earthOrbitCM = (AUtoKM / earthDiameterKM) * earthDiameterCM;
    return orbitalRadiusAU * earthOrbitCM; // Result is in cm
  };

  // Posición alineada del planeta en función del radio en metros
  const getPlanetPosition = (center, radiusInCM) => {
    const radiusInMeters = radiusInCM / 100; // Convertir cm a metros
    const angleInRadians = (alignmentAngle * Math.PI) / 180;

    // Convert center lat/lng to radians
    const latRad = center[0] * Math.PI / 180;

    // Distance in degrees for latitude
    const latOffset = (radiusInMeters / 1000) / 111; // Convert to kilometers

    // Distance in degrees for longitude
    const lngOffset = (radiusInMeters / 1000) / (111 * Math.cos(latRad));

    // Compute the new position based on the alignment angle
    const newLat = center[0] + latOffset * Math.cos(angleInRadians);
    const newLng = center[1] + lngOffset * Math.sin(angleInRadians);

    return [newLat, newLng];
  };

  // Obtener la posición de la Luna, que orbita alrededor de la Tierra
  const getMoonPosition = (earthPosition, lunarDistanceCM) => {
    return getPlanetPosition(earthPosition, lunarDistanceCM);
  };

  return (
    <Layout>
      <Head>
        <title>Solar System Map</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h1 className={styles.title}>Sistema Solar a</h1>

          <div className={styles.inputGroup}>
            <div className={styles.inputGroupItem}>
              <label className={styles.label}>Diámetro de la Tierra (cm): </label>
              <input
                className={styles.input}
                type="number"
                value={earthDiameterCM}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setEarthDiameterCM(value);
                  }
                }}
              />
            </div>
            <div className={styles.inputGroupItem}>
              <label className={styles.label}>Ángulo de alineación: </label>
              <input
                className={styles.input}
                type="number"
                value={alignmentAngle}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 360) {
                    setAlignmentAngle(value);
                  } else if (value < 0) {
                    setAlignmentAngle(0);
                  } else if (value > 360) {
                    setAlignmentAngle(360);
                  } else if (isNaN(value)) {
                    setAlignmentAngle(0);
                  }
                }}
              />
            </div>
          </div>

          <Map className={styles.homeMap} center={DEFAULT_CENTER} zoom={15}>
            {({ TileLayer, Circle, Popup, ScaleControl }) => (
              <>
                <ScaleControl position="topleft" />

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                {/* Draw the orbits first */}
                {planetData.map((planet, idx) => {
                  if (planet.orbitAround === 'Tierra') return null; // No dibujar la órbita de la Luna aquí

                  const orbitalRadiusInMeters = scaleOrbitalDistance(planet.orbitalRadiusAU) / 100; // Convert cm to meters

                  return (
                    <Circle
                      key={`orbit-${idx}`}
                      center={DEFAULT_CENTER}
                      radius={orbitalRadiusInMeters} // Set the radius of the orbit
                      pathOptions={{ color: planet.color, fillOpacity: 0.1, dashArray: '5, 5', opacity: 0.4 }} // Dashed line for orbit
                    />
                  );
                })}

                {/* Draw the planets next */}
                {planetData.map((planet, idx) => {
                  let planetPosition;

                  if (planet.name === 'Luna') {
                    const earthPosition = getPlanetPosition(
                      DEFAULT_CENTER,
                      scaleOrbitalDistance(1) // Orbital radius of Earth
                    );
                    planetPosition = getMoonPosition(earthPosition, scaleOrbitalDistance(planet.orbitalRadiusAU));
                  } else {
                    planetPosition = getPlanetPosition(
                      DEFAULT_CENTER,
                      scaleOrbitalDistance(planet.orbitalRadiusAU)
                    );
                  }

                  return (
                    <Circle
                      key={`planet-${idx}`}
                      center={planetPosition}
                      radius={scaleDiameterToMeters(planet.diameterScale) / 2} // Radius in meters
                      pathOptions={{ color: planet.color, fillOpacity: 0.9 }}
                    >
                      <Popup>
                        <div>
                          <strong>{planet.name}</strong><br />
                          Diámetro: {(scaleDiameterToMeters(planet.diameterScale) * 100).toFixed(2)} centímetros<br />
                          Distancia al Sol: {(scaleOrbitalDistance(planet.orbitalRadiusAU) / 100000).toFixed(2)} km
                        </div>
                      </Popup>
                    </Circle>
                  );
                })}
              </>
            )}
          </Map>
        </div>

        <div className={styles.planetInfo}>
          <h2>Datos de los planetas</h2>
          <ul>
            {planetData.map((planet, idx) => (
              <li key={idx}>
                <strong>{planet.name}</strong><br />
                Diámetro: {(scaleDiameterToMeters(planet.diameterScale) * 100).toFixed(2)} centímetros<br />
                Distancia al Sol: {(scaleOrbitalDistance(planet.orbitalRadiusAU) / 100000).toFixed(2)} km
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default SolarSystemMap;
