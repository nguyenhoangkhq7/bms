"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

const DEFAULT_CENTER = { lat: 10.822159, lng: 106.686824 }
const MAP_CONTAINER_STYLE: React.CSSProperties = {
  width: '100%',
  height: '360px',
  borderRadius: '20px',
}

const PHOTON_ENDPOINT = '/api/geocode/search'
const PHOTON_REVERSE_ENDPOINT = '/api/geocode/reverse'
const SEARCH_LIMIT = 5

const MARKER_ICON = L.icon({
  iconUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">' +
        '<defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">' +
        '<feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.25" />' +
        '</filter></defs>' +
        '<path filter="url(#shadow)" d="M32 4c-10.5 0-19 8.5-19 19 0 15.4 18.2 36 18.2 36 .4.5 1.2.5 1.6 0C32.8 59 51 38.4 51 23 51 12.5 42.5 4 32 4z" fill="#ef4444"/>' +
        '<circle cx="32" cy="23" r="8.5" fill="#fff"/>' +
      '</svg>'
    ),
  iconSize: [36, 36],
  iconAnchor: [18, 34],
  popupAnchor: [0, -30],
})

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: {
    name?: string
    housenumber?: string
    street?: string
    locality?: string
    district?: string
    county?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
  }
}

export interface AddressPickerProps {
  address: string
  latitude: number | null
  longitude: number | null
  onAddressChange: (value: string) => void
  onLocationChange: (coords: { lat: number; lng: number }) => void
  onLocationSelected: (selected: boolean) => void
  onReadyChange?: (ready: boolean) => void
}

export default function AddressPicker({
  address,
  latitude,
  longitude,
  onAddressChange,
  onLocationChange,
  onLocationSelected,
  onReadyChange,
}: AddressPickerProps) {
  const [mapRef, setMapRef] = useState<LeafletMap | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const activeRequestRef = useRef(0)
  const activeReverseRef = useRef(0)

  const center = useMemo(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return { lat: latitude, lng: longitude }
    }
    return DEFAULT_CENTER
  }, [latitude, longitude])

  useEffect(() => {
    if (mapRef) {
      onReadyChange?.(true)
    }
  }, [mapRef, onReadyChange])

  function formatSuggestion(feature: PhotonFeature) {
    const props = feature.properties
    if (!props) return 'Dia chi khong ro'
    const streetLine = [props.housenumber, props.street].filter(Boolean).join(' ')
    const pieces = [
      props.name,
      streetLine,
      props.locality,
      props.district,
      props.city,
      props.county,
      props.state,
      props.postcode,
      props.country,
    ].filter(Boolean)
    return pieces.length > 0 ? pieces.join(', ') : 'Dia chi khong ro'
  }

  function updateLocation(lat: number, lng: number) {
    onLocationChange({ lat, lng })
    onLocationSelected(true)
    mapRef?.flyTo([lat, lng], 15, { animate: true })
  }

  async function fetchReverse(lat: number, lng: number) {
    const requestId = ++activeReverseRef.current
    try {
      const endpoint = `${PHOTON_REVERSE_ENDPOINT}?lat=${lat}&lon=${lng}&limit=1&lang=vi`
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
      const data = (await response.json()) as { features?: PhotonFeature[] }
      if (requestId !== activeReverseRef.current) return
      const top = data.features?.[0]
      if (!top) return
      const label = formatSuggestion(top)
      if (label) {
        onAddressChange(label)
      }
    } catch {
      // best-effort reverse lookup; ignore errors silently
    }
  }

  async function fetchSuggestions(keyword: string) {
    const trimmed = keyword.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setSearchError('')
      return
    }

    const requestId = ++activeRequestRef.current
    setSearching(true)
    setSearchError('')
    try {
      const endpoint = `${PHOTON_ENDPOINT}?q=${encodeURIComponent(trimmed)}&limit=${SEARCH_LIMIT}&lat=${DEFAULT_CENTER.lat}&lon=${DEFAULT_CENTER.lng}&lang=vi`
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
      const data = (await response.json()) as { features?: PhotonFeature[] }
      if (requestId !== activeRequestRef.current) return
      setSuggestions(data.features ?? [])
      setShowSuggestions(true)
    } catch (error: any) {
      if (requestId !== activeRequestRef.current) return
      setSearchError(error?.message ?? 'Khong the tim dia chi')
      setSuggestions([])
    } finally {
      if (requestId === activeRequestRef.current) {
        setSearching(false)
      }
    }
  }

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    if (!showSuggestions && address.trim().length === 0) {
      setSuggestions([])
      return
    }

    searchTimerRef.current = setTimeout(() => {
      void fetchSuggestions(address)
    }, 300)

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [address, showSuggestions])

  function MapClickHandler() {
    useMapEvents({
      click(event) {
        onLocationChange({ lat: event.latlng.lat, lng: event.latlng.lng })
        onLocationSelected(true)
        void fetchReverse(event.latlng.lat, event.latlng.lng)
      },
    })
    return null
  }

  function MapReadyBridge() {
    const map = useMap()

    useEffect(() => {
      setMapRef(map)
    }, [map])

    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Dia chi giao hang
        </label>
        <div className="relative mt-2">
          <input
            value={address}
            onChange={(event) => {
              onAddressChange(event.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              window.setTimeout(() => setShowSuggestions(false), 150)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && suggestions.length > 0) {
                const top = suggestions[0]
                const coords = top.geometry?.coordinates
                if (coords) {
                  const [lon, lat] = coords
                  updateLocation(lat, lon)
                  onAddressChange(formatSuggestion(top))
                  setShowSuggestions(false)
                }
              }
            }}
            placeholder="So nha, duong, quan/huyen..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none"
          />
          {showSuggestions && (searching || suggestions.length > 0) && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-xl">
              {searching && (
                <div className="rounded-xl px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Dang tim kiem...
                </div>
              )}
              {!searching &&
                suggestions.map((item, index) => {
                  const coords = item.geometry?.coordinates
                  const label = formatSuggestion(item)
                  const key = `${label}-${index}`
                  return (
                    <button
                      key={key}
                      type="button"
                      className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100"
                      onClick={() => {
                        if (!coords) return
                        const [lon, lat] = coords
                        onAddressChange(label)
                        updateLocation(lat, lon)
                        setShowSuggestions(false)
                      }}
                    >
                      <span className="font-semibold text-slate-900">
                        {item.properties?.name ?? item.properties?.street ?? label}
                      </span>
                      <span className="text-xs text-slate-500">{label}</span>
                    </button>
                  )
                })}
              {!searching && suggestions.length === 0 && (
                <div className="rounded-xl px-3 py-2 text-xs text-slate-500">
                  Khong co goi y phu hop.
                </div>
              )}
            </div>
          )}
        </div>
        {searchError && <p className="mt-2 text-xs text-amber-600">{searchError}</p>}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom
          style={MAP_CONTAINER_STYLE}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapReadyBridge />
          <MapClickHandler />
          <Marker position={center} draggable={false} icon={MARKER_ICON} />
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500">
        Click tren ban do de chon toa do chinh xac.
      </p>
    </div>
  )
}
