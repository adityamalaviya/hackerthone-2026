import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CivicIssue } from '../data/mockIssues';
import { TOKENS } from '../styles/tokens';
import { CaretRight, CheckCircle, Clock, WarningCircle, Funnel } from '@phosphor-icons/react';
import { getAllIssues, subscribeToIssues } from '../lib/appwrite';
import { getAllCivicIssues, subscribeToNewIssues, getStoredUserReports } from '../lib/issueStore';

// Create custom minimalist status markers referencing design tokens
const createMinimalMarker = (status: CivicIssue['status']) => {
  let color: string = TOKENS.colors.status.reported;
  let ringColor = 'rgba(220, 38, 38, 0.35)';

  if (status === 'Acknowledged' || status === 'In Progress') {
    color = TOKENS.colors.status.inProgress;
    ringColor = 'rgba(217, 119, 6, 0.35)';
  } else if (status === 'Resolved' || status === 'Closed') {
    color = TOKENS.colors.status.resolved;
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
  const [issues, setIssues] = useState<CivicIssue[]>(() => getAllCivicIssues());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(() => getAllCivicIssues()[0] || null);

  // Subscribe to newly reported civic issues
  useEffect(() => {
    const unsub = subscribeToNewIssues((newReport) => {
      setIssues((prev) => [newReport, ...prev]);
      setSelectedIssue(newReport);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;

    // Fetch live issues from Appwrite Database
    getAllIssues()
      .then((docs) => {
        if (mounted && Array.isArray(docs) && docs.length > 0) {
          const liveIssues: CivicIssue[] = docs.map((doc: any) => ({
            id: doc.$id || doc.id,
            title: doc.title,
            category: (doc.category || 'Other') as CivicIssue['category'],
            description: doc.description || '',
            status: (doc.status || 'Reported') as CivicIssue['status'],
            latitude: Number(doc.latitude) || 23.0792,
            longitude: Number(doc.longitude) || 70.1345,
            locationName: doc.locationName || 'Gandhidham',
            reportedAt: doc.createdAt
              ? new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recently',
            ward: doc.ward || 'Ward 4 (Central)',
            votes: typeof doc.votes === 'number' ? doc.votes : 0,
          }));
          const stored = getStoredUserReports();
          setIssues([...stored, ...liveIssues]);
          setSelectedIssue(stored[0] || liveIssues[0]);
        }
      })
      .catch(() => {
        // Fall back gracefully to stored and mock issues
        setIssues(getAllCivicIssues());
      });

    // Realtime subscription for live map pin updates
    const unsubscribe = subscribeToIssues(() => {
      if (!mounted) return;
      getAllIssues()
        .then((docs) => {
          if (mounted && Array.isArray(docs) && docs.length > 0) {
            const liveIssues: CivicIssue[] = docs.map((doc: any) => ({
              id: doc.$id || doc.id,
              title: doc.title,
              category: (doc.category || 'Other') as CivicIssue['category'],
              description: doc.description || '',
              status: (doc.status || 'Reported') as CivicIssue['status'],
              latitude: Number(doc.latitude) || 23.0792,
              longitude: Number(doc.longitude) || 70.1345,
              locationName: doc.locationName || 'Gandhidham',
              reportedAt: doc.createdAt
                ? new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recently',
              ward: doc.ward || 'Ward 4 (Central)',
              votes: typeof doc.votes === 'number' ? doc.votes : 0,
            }));
            const stored = getStoredUserReports();
            setIssues([...stored, ...liveIssues]);
          }
        })
        .catch(() => {});
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const filteredIssues = selectedCategory === 'All' 
    ? issues 
    : issues.filter(issue => issue.category === selectedCategory);

  const categories = ['All', 'Pothole', 'Streetlight', 'Garbage', 'Water Leakage', 'Drainage'];

  return (
    <section id="map" className="py-12 md:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
      
      {/* Header & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-civic-200 dark:border-civic-800 gap-4">
        <div>
          <span className="text-2xs font-mono uppercase tracking-wider text-civic-500 dark:text-civic-400 block mb-1">
            Gandhidham Public Ledger
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-civic-950 dark:text-civic-50">
            Live Civic Issues Map
          </h2>
          <p className="text-xs sm:text-sm text-civic-600 dark:text-civic-400 mt-1">
            Centered on Gandhidham (~23.08°N, 70.13°E). Updated continuously by verified citizen uploads.
          </p>
        </div>

        {/* Minimal Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-civic-600 dark:text-civic-300 bg-white dark:bg-civic-900 px-3.5 py-2 rounded-lg border border-civic-200 dark:border-civic-800 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-reported"></span>
            <span>Reported ({issues.filter(i => i.status === 'Reported').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-progress"></span>
            <span>In Progress ({issues.filter(i => i.status === 'In Progress' || i.status === 'Acknowledged').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-resolved"></span>
            <span>Resolved ({issues.filter(i => i.status === 'Resolved').length})</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
        <span className="text-civic-400 dark:text-civic-500 font-medium mr-1 flex items-center gap-1">
          <Funnel size={13} />
          Filter:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium cursor-pointer ${
              selectedCategory === cat
                ? 'bg-civic-950 text-white dark:bg-civic-100 dark:text-civic-950 shadow-xs'
                : 'bg-civic-100/80 text-civic-600 hover:bg-civic-200/80 hover:text-civic-900 dark:bg-civic-800 dark:text-civic-300 dark:hover:bg-civic-700 dark:hover:text-civic-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map + Detail Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 rounded-xl border border-civic-200 dark:border-civic-800 overflow-hidden bg-white dark:bg-civic-900 shadow-sm">
        
        {/* Map Canvas (2 cols) */}
        <div className="lg:col-span-2 h-108 sm:h-120 relative bg-civic-100 dark:bg-civic-950">
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
                    <div className="mt-2 inline-block px-1.5 py-0.5 rounded text-3xs font-medium bg-civic-100 text-civic-700">
                      Status: {issue.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Overlay Map Badge */}
          <div className="absolute bottom-3 left-3 z-400 bg-white/95 dark:bg-civic-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-civic-200 dark:border-civic-800 text-2xs font-mono text-civic-600 dark:text-civic-400 shadow-sm pointer-events-none">
            Center: 23.0784° N, 70.1337° E • Gandhidham, Gujarat
          </div>
        </div>

        {/* Selected Issue Detail / Inspector (1 col) */}
        <div className="p-5 sm:p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-civic-200 dark:border-civic-800 bg-civic-50 dark:bg-civic-900">
          {selectedIssue ? (
            <div className="space-y-4">
              
              {/* Header Status & ID */}
              <div className="flex items-center justify-between pb-3 border-b border-civic-200 dark:border-civic-800">
                <span className="font-mono text-2xs text-civic-500 dark:text-civic-400 font-semibold">
                  {selectedIssue.id}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium ${
                  selectedIssue.status === 'Resolved' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : selectedIssue.status === 'In Progress' || selectedIssue.status === 'Acknowledged'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                }`}>
                  {selectedIssue.status === 'Resolved' && <CheckCircle size={12} weight="fill" />}
                  {(selectedIssue.status === 'In Progress' || selectedIssue.status === 'Acknowledged') && <Clock size={12} weight="fill" />}
                  {selectedIssue.status === 'Reported' && <WarningCircle size={12} weight="fill" />}
                  {selectedIssue.status}
                </span>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-base font-semibold text-civic-950 dark:text-civic-100 leading-snug">
                  {selectedIssue.title}
                </h3>
                <p className="text-xs text-civic-600 dark:text-civic-400 mt-2 leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Geo & Ward Meta */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1 border-b border-civic-200/60 dark:border-civic-800/60">
                  <span className="text-civic-500 dark:text-civic-400 font-mono">Location</span>
                  <span className="text-civic-900 dark:text-civic-100 font-medium text-right">{selectedIssue.locationName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-civic-200/60 dark:border-civic-800/60">
                  <span className="text-civic-500 dark:text-civic-400 font-mono">Ward</span>
                  <span className="text-civic-900 dark:text-civic-100 font-medium">{selectedIssue.ward}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-civic-200/60 dark:border-civic-800/60">
                  <span className="text-civic-500 dark:text-civic-400 font-mono">Reported</span>
                  <span className="text-civic-700 dark:text-civic-300">{selectedIssue.reportedAt}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-civic-500 dark:text-civic-400 font-mono">Coordinates</span>
                  <span className="text-civic-700 dark:text-civic-300 font-mono text-2xs">{selectedIssue.latitude.toFixed(4)}, {selectedIssue.longitude.toFixed(4)}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-civic-400 dark:text-civic-500 text-xs">
              Click any pin on the map to inspect case details.
            </div>
          )}

            {/* Action Trigger */}
            <div className="pt-4 border-t border-civic-200 dark:border-civic-800 mt-4">
            <a
              href="#track"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-civic-900 bg-white hover:bg-civic-100 dark:text-civic-100 dark:bg-civic-800 dark:hover:bg-civic-700 border border-civic-200 dark:border-civic-700 rounded-lg transition-colors"
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
