import { useEffect, useState } from "react";
import Leaflet from "leaflet";
import * as ReactLeaflet from "react-leaflet";
import "leaflet/dist/leaflet.css";

import styles from "./Map.module.scss";

const { MapContainer, TileLayer, useMapEvent, useMap } = ReactLeaflet;

const MapEvents = ({ setCenter }) => {
  // Escuchar el evento de clic
  useMapEvent("click", (e) => {
    const newCenter = e.latlng;
    console.log("Nuevo centro:", newCenter);
    // Actualizar el estado del centro con las nuevas coordenadas
    setCenter([newCenter.lat, newCenter.lng]);
  });

  return null; // No renderiza nada
};

const Map = ({ children, className, center, zoom, ...rest }) => {
  let mapClassName = styles.map;

  if (className) {
    mapClassName = `${mapClassName} ${className}`;
  }

  useEffect(() => {
    (async function init() {
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "leaflet/images/marker-icon-2x.png",
        iconUrl: "leaflet/images/marker-icon.png",
        shadowUrl: "leaflet/images/marker-shadow.png",
      });
    })();
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={mapClassName}
      {...rest}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Escuchar eventos de clic */}
      <MapEvents setCenter={rest.setCenter} />

      {/* Renderizar otros elementos como círculos, marcadores, etc. */}
      {children(ReactLeaflet, Leaflet)}
    </MapContainer>
  );
};

export default Map;
