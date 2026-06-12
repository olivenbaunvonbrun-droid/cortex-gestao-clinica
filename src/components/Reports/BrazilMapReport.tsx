import React, { useState, useEffect, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { BarChart3, MapPin, Globe, Users, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Patient } from '../../lib/db';

// Brazil states TopoJSON from public IBGE data via cdn.jsdelivr.net
const BRAZIL_TOPO_URL =
  'https://cdn.jsdelivr.net/npm/react-simple-maps@3/examples/data/topo/brazil-states.json';

// Fallback: use a well-known CDN that serves Brazil topojson
const BRAZIL_GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// State name mapping UF → full name
const UF_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
  PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
};

interface BrazilMapReportProps {
  patients: Patient[];
}

const BrazilMapReport = memo(function BrazilMapReport({ patients }: BrazilMapReportProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [geoError, setGeoError] = useState(false);

  // Load GeoJSON
  useEffect(() => {
    fetch(BRAZIL_GEO_URL)
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(() => setGeoError(true));
  }, []);

  // Aggregate patients per state
  const stateCounts: Record<string, number> = {};
  patients.forEach(p => {
    if (p.estado) {
      const uf = p.estado.trim().toUpperCase().substring(0, 2);
      if (UF_NAMES[uf]) stateCounts[uf] = (stateCounts[uf] || 0) + 1;
    }
  });

  const maxCount = Math.max(...Object.values(stateCounts), 1);
  const totalWithState = Object.values(stateCounts).reduce((a, b) => a + b, 0);
  const statesWithNoData = patients.length - totalWithState;

  const ranked = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([uf, count]) => ({
      uf,
      name: UF_NAMES[uf] || uf,
      count,
      pct: ((count / totalWithState) * 100).toFixed(1),
    }));

  // Heat-map color ramp in Cortex palette
  const getColor = (uf: string): string => {
    const count = stateCounts[uf] || 0;
    if (count === 0) return '#162032';      // dark navy (empty)
    const ratio = count / maxCount;
    if (ratio <= 0.2)  return '#7c3e0a';    // very low  – burnt amber
    if (ratio <= 0.4)  return '#b45309';    // low       – amber 700
    if (ratio <= 0.6)  return '#d97706';    // medium    – amber 600
    if (ratio <= 0.8)  return '#f59e0b';    // high      – amber 500
    return '#bf9b6b';                       // max       – primary gold
  };

  const getStateName = (properties: any): string => {
    return (
      properties?.sigla ||
      properties?.UF_05 ||
      properties?.uf ||
      properties?.abbrev ||
      properties?.SIGLA ||
      ''
    ).toUpperCase();
  };

  // Mouse handlers
  const handleMouseEnter = (uf: string, evt: React.MouseEvent) => {
    setHoveredState(uf);
    setTooltip({
      x: evt.clientX,
      y: evt.clientY,
      name: UF_NAMES[uf] || uf,
      count: stateCounts[uf] || 0,
    });
  };
  const handleMouseMove = (evt: React.MouseEvent) => {
    if (tooltip) setTooltip(prev => prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null);
  };
  const handleMouseLeave = () => {
    setHoveredState(null);
    setTooltip(null);
  };

  const LEGEND = [
    { color: '#162032', label: 'Nenhum' },
    { color: '#7c3e0a', label: '1' },
    { color: '#b45309', label: '2–3' },
    { color: '#d97706', label: '4–6' },
    { color: '#bf9b6b', label: '7+' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Mapeados', value: totalWithState, color: 'text-text-main' },
          { label: 'Estados Presentes', value: Object.keys(stateCounts).length, color: 'text-primary' },
          { label: 'Estado Líder', value: ranked[0]?.uf || '—', sub: ranked[0]?.name, color: 'text-amber-400' },
          { label: 'Sem Estado', value: statesWithNoData, color: 'text-text-dim' },
        ].map(card => (
          <div key={card.label} className="bg-bg-card border border-border-subtle p-6 rounded-[2rem] shadow-xl">
            <p className="text-[9px] font-black text-text-dim uppercase tracking-[0.25em] mb-2">{card.label}</p>
            <p className={`text-3xl font-display font-black tabular-nums ${card.color}`}>{card.value}</p>
            {card.sub && <p className="text-[9px] text-text-dim font-bold mt-1 truncate">{card.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map */}
        <div className="lg:col-span-8 bg-bg-card border border-border-subtle rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full pointer-events-none" />

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] flex items-center gap-3">
              <MapPin size={14} className="text-primary" /> Mapa de Distribuição — Brasil
            </h3>
            {hoveredState && (
              <div className="flex items-center gap-2 px-4 py-2 bg-bg-sidebar rounded-2xl border border-border-subtle animate-in fade-in duration-100">
                <div className="w-2 h-2 rounded-full" style={{ background: getColor(hoveredState) }} />
                <span className="text-[10px] font-black text-text-main uppercase tracking-wide">
                  {UF_NAMES[hoveredState] || hoveredState}
                </span>
                <span className="text-[10px] font-black text-primary">
                  {stateCounts[hoveredState] || 0} pac.
                </span>
              </div>
            )}
          </div>

          {/* Map canvas */}
          <div className="relative w-full" onMouseMove={handleMouseMove} style={{ minHeight: 420 }}>
            {geoError ? (
              <div className="flex flex-col items-center justify-center h-64 text-text-dim opacity-40">
                <Globe size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Mapa indisponível offline</p>
              </div>
            ) : !geoData ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 780, center: [-54, -15] }}
                style={{ width: '100%', height: 'auto' }}
                viewBox="0 0 800 700"
              >
                <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={6}>
                  <Geographies geography={geoData}>
                    {({ geographies }) =>
                      geographies.map(geo => {
                        const uf = getStateName(geo.properties);
                        const isHovered = hoveredState === uf;
                        const count = stateCounts[uf] || 0;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={getColor(uf)}
                            stroke={isHovered ? '#ffffff' : '#0f172a'}
                            strokeWidth={isHovered ? 1.5 : 0.5}
                            style={{
                              default: { outline: 'none', filter: count > 0 ? 'brightness(1)' : 'none', transition: 'all 0.2s ease' },
                              hover: { outline: 'none', fill: count > 0 ? '#f8d48f' : '#1e3a52', filter: count > 0 ? 'brightness(1.2) drop-shadow(0 0 6px rgba(245,158,11,0.5))' : 'brightness(1.3)', cursor: 'pointer', transition: 'all 0.15s ease' },
                              pressed: { outline: 'none' },
                            }}
                            onMouseEnter={(e: any) => handleMouseEnter(uf, e)}
                            onMouseLeave={handleMouseLeave}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            )}

            {/* Floating tooltip */}
            {tooltip && (
              <div
                className="fixed z-[9999] pointer-events-none px-4 py-3 rounded-2xl bg-bg-deep/95 border border-border-subtle shadow-2xl backdrop-blur-md"
                style={{ left: tooltip.x + 14, top: tooltip.y - 40 }}
              >
                <p className="text-[11px] font-black text-text-main">{tooltip.name}</p>
                <p className="text-[10px] text-primary font-bold">
                  {tooltip.count > 0 ? `${tooltip.count} paciente${tooltip.count > 1 ? 's' : ''}` : 'Nenhum paciente'}
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-5">
            <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">
              Intensidade por Pacientes
            </span>
            <div className="flex items-center gap-3">
              {LEGEND.map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-white/10 shrink-0" style={{ background: item.color }} />
                  <span className="text-[8px] font-black text-text-dim uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
          <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
            <BarChart3 size={14} className="text-primary" /> Ranking por Estado
          </h3>

          {ranked.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 gap-4">
              <Globe size={40} className="text-text-dim" />
              <div>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nenhum estado cadastrado</p>
                <p className="text-[9px] text-text-dim/60 mt-1">Preencha o campo "Estado" nos perfis</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
              {ranked.map((item, i) => (
                <div
                  key={item.uf}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-default',
                    hoveredState === item.uf
                      ? 'bg-primary/10 border-primary/30 scale-[1.01]'
                      : 'bg-bg-sidebar/40 border-border-subtle hover:border-primary/20',
                  )}
                  onMouseEnter={() => setHoveredState(item.uf)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <span className="text-[9px] font-black text-text-dim w-4 text-right tabular-nums shrink-0">{i + 1}</span>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-black text-white shrink-0 border border-white/10"
                    style={{ background: getColor(item.uf) }}
                  >
                    {item.uf}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] font-black text-text-main truncate leading-none mb-1.5">{item.name}</p>
                    <div className="w-full bg-bg-deep rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(item.count / maxCount) * 100}%`, background: getColor(item.uf) }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-black text-primary tabular-nums leading-none">{item.count}</p>
                    <p className="text-[8px] font-bold text-text-dim tabular-nums">{item.pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {statesWithNoData > 0 && (
            <div className="mt-5 pt-5 border-t border-border-subtle">
              <p className="text-[9px] font-black text-text-dim uppercase tracking-widest text-center">
                {statesWithNoData} paciente{statesWithNoData > 1 ? 's' : ''} sem estado cadastrado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default BrazilMapReport;
