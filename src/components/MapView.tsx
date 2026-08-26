import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Pin } from '../data/games'
import type { Lang } from '../data/i18n'
import { SHELL_I18N } from '../data/i18n'

function pinToLatLng(p: Pin): L.LatLngExpression {
  return [p.lat, p.lng]
}

function makePinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38],
    html: `
      <svg viewBox="0 0 24 32" width="28" height="38" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">
        <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 8 10.5 18 10.5 18s10.5-10 10.5-18c0-5.8-4.7-10.5-10.5-10.5z"
              fill="${color}" stroke="#5C140F" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="12" cy="11.5" r="3.8" fill="#EFDFB8" stroke="#5C140F" stroke-width="1.4"/>
      </svg>
    `,
  })
}

export function MapView({
  pins,
  path,
  lang,
  onPinClick,
}: {
  pins: Pin[]
  path: boolean
  lang: Lang
  onPinClick: (pin: Pin) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 8,
    }).addTo(map)

    const latlngs = pins.map(pinToLatLng)
    const bounds = L.latLngBounds(latlngs)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 })

    if (path && latlngs.length > 1) {
      L.polyline(latlngs, {
        color: '#EFA90C',
        weight: 2.5,
        dashArray: '8 6',
        opacity: 0.8,
        lineCap: 'round',
      }).addTo(map)
    }

    pins.forEach((pin, i) => {
      const color = i === 0 ? '#EFA90C' : '#D8401F'
      const marker = L.marker(latlngs[i], { icon: makePinIcon(color) }).addTo(map)
      marker.on('click', () => onPinClick(pin))
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  const S = SHELL_I18N[lang]

  return (
    <div className="map-frame leaflet-map-wrap">
      <div ref={containerRef} className="leaflet-map-container" />
      <div className="map-caption">
        {path ? S.stitchedLine : S.scatteredPins}
      </div>
    </div>
  )
}
