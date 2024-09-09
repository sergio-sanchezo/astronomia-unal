import Head from 'next/head';
import Layout from '@components/Layout';
import Map from '@components/Map';
import { useState } from 'react';

import styles from '@styles/Home.module.scss';

const DEFAULT_CENTER = [4.646541, -74.08175]; // Coordenadas de Bogotá

const SolarSystemMap = () => {
  const [earthDiameterCM, setEarthDiameterCM] = useState(22); // Diámetro de la Tierra en cm
  const [alignmentAngle, setAlignmentAngle] = useState(0); // Ángulo de alineación

  const planetData = [
    { name: 'Sol', diameterScale: 109, color: 'red', orbitalRadiusAU: 0 }, // El Sol en el centro
    { name: 'Mercurio', diameterScale: 0.39, color: 'red', orbitalRadiusAU: 0.39 },
    { name: 'Venus', diameterScale: 0.95, color: 'red', orbitalRadiusAU: 0.72 },
    { name: 'Tierra', diameterScale: 1, color: 'red', orbitalRadiusAU: 1 },
    { name: 'Marte', diameterScale: 0.53, color: 'red', orbitalRadiusAU: 1.52 },
    { name: 'Júpiter', diameterScale: 11.2, color: 'red', orbitalRadiusAU: 5.2 },
    { name: 'Saturno', diameterScale: 9.41, color: 'red', orbitalRadiusAU: 9.54 },
    { name: 'Urano', diameterScale: 3.98, color: 'red', orbitalRadiusAU: 19.19 },
    { name: 'Neptuno', diameterScale: 3.81, color: 'red', orbitalRadiusAU: 30.06 }
  ];

  const AUtoKM = 149597870.7;
  const earthDiameterKM = 12756;

  // Escalar el diámetro del planeta
  const scaleDiameter = (diameterScale) => diameterScale * earthDiameterCM;

  // Escalar las distancias orbitales sin factor de escala adicional
  const scaleOrbitalDistance = (orbitalRadiusAU) => {
    const earthOrbitCM = (AUtoKM / earthDiameterKM) * earthDiameterCM;
    return orbitalRadiusAU * earthOrbitCM;
  };

  // Posición alineada del planeta
  const getPlanetPosition = (center, radius) => {
    const angleInRadians = (alignmentAngle * Math.PI) / 180;
    const latOffset = radius * Math.cos(angleInRadians) / 111000;
    const lngOffset = radius * Math.sin(angleInRadians) / (111000 * Math.cos(center[0] * (Math.PI / 180)));
    return [center[0] + latOffset, center[1] + lngOffset];
  };

  return (
    <Layout>
      <Head>
        <title>Solar System Map</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h1 className={styles.title}>Mapa del Sistema Solar</h1>

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
                  }
                }}
                min="0"
                max="360"
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

                {planetData.map((planet, idx) => {
                  const planetPosition = getPlanetPosition(
                    DEFAULT_CENTER,
                    scaleOrbitalDistance(planet.orbitalRadiusAU)
                  );
                  return (
                    <Circle
                      key={idx}
                      center={planetPosition}
                      radius={scaleDiameter(planet.diameterScale) / 2}
                      pathOptions={{ color: planet.color, fillOpacity: 0.5 }}
                    >
                      <Popup>
                        <div>
                          <strong>{planet.name}</strong><br />
                          Diámetro: {scaleDiameter(planet.diameterScale).toFixed(2)} cm<br />
                          Distancia al sol: {scaleOrbitalDistance(planet.orbitalRadiusAU).toFixed(2)} cm
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
                Diámetro: {scaleDiameter(planet.diameterScale).toFixed(2)} cm<br />
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