import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MOCK_ISSUES, CivicIssue } from '../data/mockIssues';
import { CaretRight, CheckCircle, Clock, WarningCircle, Funnel } from '@phosphor-icons/react';

// Create custom minimalist status markers
const createMinimalMarker = (status: CivicIssue['status']) => {
  let color = '#dc2626'; // reported
  let ringColor = 'rgba(220, 38, 38, 0.35)';

  if (status === 'Acknowledged' || status === 'In Progress') {
    color = '#d97706'; // progress
    ringColor = 'rgba(217, 119, 6, 0.35)';
  } else if (status === 'Resolved' || status === 'Closed') {
    color = '#16a34a'; // resolved
    ringColor = 'rgba(22, 163, 74, 0.35)';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
        <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background: ${ringColor}; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 14px; height: 14px; border-radius: 9999px; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.25); position: relative; z-index: 2;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export const MapPreview: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(MOCK_ISSUES[0]);

  const filteredIssues = selectedCategory === 'All' 
    ? MOCK_ISSUES 
    : MOCK_ISSUES.filter(issue => issue.category === selectedCategory);

  const categories = ['All', 'Pothole', 'Streetlight', 'Garbage', 'Water Leakage', 'Drainage'];

  return (
    <section id="map" className="py-12 md:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
      
      {/* Header & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-civic-200 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-civic-500 block mb-1">
            Gandhidham Public Ledger
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-civic-950">
            Live Civic Issues Map
          </h2>
          <p className="text-xs sm:text-sm text-civic-600 mt-1">
            Centered on Gandhidham (~23.08°N, 70.13°E). Updated continuously by verified citizen uploads.
          </p>
        </div>

        {/* Minimal Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-civic-600 bg-white px-3 py-2 rounded-md border border-civic-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Reported ({MOCK_ISSUES.filter(i => i.status === 'Reported').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span>In Progress ({MOCK_ISSUES.filter(i => i.status === 'In Progress' || i.status === 'Acknowledged').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Resolved ({MOCK_ISSUES.filter(i => i.status === 'Resolved').length})</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
        <span className="text-civic-400 font-medium mr-1 flex items-center gap-1">
          <Funnel size={13} />
          Filter:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all font-medium ${
              selectedCategory === cat
                ? 'bg-civic-900 text-white shadow-sm'
                : 'bg-civic-100/80 text-civic-600 hover:bg-civic-200/80 hover:text-civic-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map + Detail Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 rounded-lg border border-civic-200 overflow-hidden bg-white shadow-sm">
        
        {/* Map Canvas (2 cols) */}
        <div className="lg:col-span-2 h-[420px] sm:h-[480px] relative bg-civic-100">
          <MapContainer
            center={[23.0784, 70.1337]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredIssues.map(issue => (
              <Marker
                key={issue.id}
                position={[issue.latitude, issue.longitude]}
                icon={createMinimalMarker(issue.status)}
                eventHandlers={{
                  click: () => setSelectedIssue(issue),
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-semibold text-civic-900">{issue.title}</div>
                    <div className="text-civic-500 mt-0.5">{issue.locationName}</div>
                    <div className="mt-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-civic-100 text-civic-700">
                      Status: {issue.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Overlay Map Badge */}
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded border border-civic-200 text-[11px] font-mono text-civic-600 shadow-sm pointer-events-none">
            Center: 23.0784° N, 70.1337° E • Gandhidham, Gujarat
          </div>
        </div>

        {/* Selected Issue Detail / Inspector (1 col) */}
        <div className="p-5 sm:p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-civic-200 bg-[#FAF9F6]">
          {selectedIssue ? (
            <div className="space-y-4">
              
              {/* Header Status & ID */}
              <div className="flex items-center justify-between pb-3 border-b border-civic-200">
                <span className="font-mono text-[11px] text-civic-500 font-semibold">
                  {selectedIssue.id}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                  selectedIssue.status === 'Resolved' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : selectedIssue.status === 'In Progress' || selectedIssue.status === 'Acknowledged'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {selectedIssue.status === 'Resolved' && <CheckCircle size={12} weight="fill" />}
                  {(selectedIssue.status === 'In Progress' || selectedIssue.status === 'Acknowledged') && <Clock size={12} weight="fill" />}
                  {selectedIssue.status === 'Reported' && <WarningCircle size={12} weight="fill" />}
                  {selectedIssue.status}
                </span>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-base font-semibold text-civic-950 leading-snug">
                  {selectedIssue.title}
                </h3>
                <p className="text-xs text-civic-600 mt-2 leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Geo & Ward Meta */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1 border-b border-civic-200/60">
                  <span className="text-civic-500 font-mono">Location</span>
                  <span className="text-civic-900 font-medium text-right">{selectedIssue.locationName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-civic-200/60">
                  <span className="text-civic-500 font-mono">Ward</span>
                  <span className="text-civic-900 font-medium">{selectedIssue.ward}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-civic-200/60">
                  <span className="text-civic-500 font-mono">Reported</span>
                  <span className="text-civic-700">{selectedIssue.reportedAt}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-civic-500 font-mono">Coordinates</span>
                  <span className="text-civic-700 font-mono text-[11px]">{selectedIssue.latitude.toFixed(4)}, {selectedIssue.longitude.toFixed(4)}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-civic-400 text-xs">
              Click any pin on the map to inspect case details.
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-4 border-t border-civic-200 mt-4">
            <a
              href="#track"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-civic-900 bg-white hover:bg-civic-100 border border-civic-200 rounded-md transition-colors"
            >
              <span>View Full Audit Timeline</span>
              <CaretRight size={12} weight="bold" />
            </a>
          </div>

        </div>

      </div>

    </section>
  );
};
