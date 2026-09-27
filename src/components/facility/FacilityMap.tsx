import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Beneficiary, HealthcareFacility } from '../../types';

interface FacilityMapProps {
  patient: Beneficiary;
  facilities: HealthcareFacility[];
  selectedFacilityId?: string;
  recommendedFacilityId?: string;
  onSelectFacility: (facilityId: string) => void;
}

const facilityIcon = (number: number, selected: boolean, recommended: boolean): L.DivIcon =>
  L.divIcon({
    className: `facility-map-pin ${selected ? 'facility-map-pin-selected' : ''} ${recommended ? 'facility-map-pin-recommended' : ''}`,
    html: `<span aria-hidden="true">${number}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const patientIcon = L.divIcon({
  className: 'facility-map-patient',
  html: '<span aria-hidden="true">P</span>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const FacilityMap: React.FC<FacilityMapProps> = ({
  patient,
  facilities,
  selectedFacilityId,
  recommendedFacilityId,
  onSelectFacility,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const facilityMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    const coordinates = patient.syntheticCoordinates;
    if (!container || !coordinates) return;

    const map = L.map(container, { scrollWheelZoom: false, zoomControl: true });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
    }).addTo(map);

    const patientPoint: L.LatLngExpression = [coordinates.latitude, coordinates.longitude];
    const points: L.LatLngExpression[] = [patientPoint];
    L.marker(patientPoint, {
      icon: patientIcon,
      title: `${patient.fullName} · synthetic/demo location`,
      alt: `${patient.fullName}, patient location, synthetic demo point`,
      keyboard: true,
    }).bindPopup(`${patient.fullName} · Patient (synthetic location)`).addTo(map);

    const markerMap = new Map<string, L.Marker>();
    facilities.forEach((facility, index) => {
      const point: L.LatLngExpression = [facility.latitude, facility.longitude];
      points.push(point);
      const marker = L.marker(point, {
        icon: facilityIcon(index + 1, facility.id === selectedFacilityId, facility.id === recommendedFacilityId),
        title: `${facility.name} · ${facility.distanceKm.toFixed(1)} km · approximately ${facility.estimatedTransitMinutes} minutes, synthetic estimate`,
        alt: `${facility.name}${facility.id === recommendedFacilityId ? ', recommended referral option' : ', alternative facility'}`,
        keyboard: true,
      });
      const popup = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = facility.name;
      const estimate = document.createElement('div');
      estimate.textContent = `${facility.distanceKm.toFixed(1)} km · ~${facility.estimatedTransitMinutes} min (synthetic)`;
      popup.append(name, estimate);
      marker.bindPopup(popup);
      marker.on('click', () => onSelectFacility(facility.id));
      marker.addTo(map);
      markerMap.set(facility.id, marker);
    });
    facilityMarkersRef.current = markerMap;
    map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 12 });

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      markerMap.clear();
      map.remove();
      mapRef.current = null;
      facilityMarkersRef.current.clear();
    };
    // Map layers are initialized once for this patient and facility set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id, facilities, onSelectFacility]);

  useEffect(() => {
    facilityMarkersRef.current.forEach((marker, facilityId) => {
      const index = facilities.findIndex((facility) => facility.id === facilityId);
      marker.setIcon(facilityIcon(index + 1, facilityId === selectedFacilityId, facilityId === recommendedFacilityId));
    });
    const selected = facilities.find((facility) => facility.id === selectedFacilityId);
    if (selected) mapRef.current?.panTo([selected.latitude, selected.longitude], { animate: true });
  }, [facilities, recommendedFacilityId, selectedFacilityId]);

  return (
    <div
      ref={containerRef}
      className="facility-map h-[300px] w-full overflow-hidden rounded-lg border border-outline-variant/40 sm:h-[360px]"
      role="region"
      aria-label="Interactive map showing a synthetic patient point and nearby facility demo points. Use the zoom controls, pan the map, or choose a facility marker."
    />
  );
};

export default FacilityMap;
