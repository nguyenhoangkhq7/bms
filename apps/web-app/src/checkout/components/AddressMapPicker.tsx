"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

type Props = {
  latitude: number;
  longitude: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });
  return null;
}

export default function AddressMapPicker({ latitude, longitude, onChange }: Props) {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const center = useMemo<[number, number]>(() => position, [position]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={center} zoom={13} style={{ height: 280, width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler
          onChange={(coords) => {
            setPosition([coords.latitude, coords.longitude]);
            onChange(coords);
          }}
        />
        <Marker
          position={position}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const latLng = (event.target as L.Marker).getLatLng();
              const next = [latLng.lat, latLng.lng] as [number, number];
              setPosition(next);
              onChange({ latitude: latLng.lat, longitude: latLng.lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
