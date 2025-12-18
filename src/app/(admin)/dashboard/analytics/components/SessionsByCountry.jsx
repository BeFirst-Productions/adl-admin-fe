// SessionsByCountry.jsx - COMPLETE WORKING VERSION WITH MAP FIX

import React, { Fragment, useEffect, useMemo, useState, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  ProgressBar,
  Button,
  Spinner,
  Alert
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
// import { getSessionsByCountry } from "@/api/apis";
import { useSessionsByCountry } from "@/hooks/useSessionsByCountry";

// CRITICAL: Import jsvectormap properly
import jsVectorMap from "jsvectormap";


// CRITICAL: Import world map data
// The map data must be imported AFTER jsVectorMap core
let worldMapLoaded = false;
const loadWorldMap = async () => {
  if (!worldMapLoaded) {
    try {
      await import("jsvectormap/dist/maps/world.js");
      worldMapLoaded = true;
      // console.log("✓ World map data loaded");
    } catch (error) {
      throw("Failed to load world map:", error);
    }
  }
};

// Range options for dropdown
const RANGES = [
  { key: "24h", label: "Last 24 Hours", icon: "bx:time" },
  { key: "7d", label: "Last 7 Days", icon: "bx:calendar" },
  { key: "28d", label: "Last 28 Days", icon: "bx:calendar-alt" },
  { key: "3mo", label: "Last 3 Months", icon: "bx:calendar-event" },
];




// Flag renderer
const renderFlag = (iso) => {
  if (!iso || iso === "(not set)") {
    return <span className="me-2" style={{ fontSize: '18px' }}>🌍</span>;
  }
  return (
    <img
      src={`https://flagcdn.com/w20/${iso.toLowerCase()}.png`}
      alt={iso}
      width={20}
      height={14}
      style={{ marginRight: 8, borderRadius: 2, objectFit: "cover" }}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
};

// ============================================================
//                MAIN COMPONENT
// ============================================================
export default function SessionsByCountry({
  defaultRange = "3mo",
  metric = "activeUsers",
  topN = 250,
}) {
  const [range, setRange] = useState(defaultRange);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const [rows, setRows] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);


const {
  data: rows = [],
  isLoading: loading,
  error,
} = useSessionsByCountry({ range, metric, topN });

useEffect(() => {
  // Load CSS from CDN if not already loaded
  const existingLink = document.querySelector('link[href*="jsvectormap"]');
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/jsvectormap/dist/css/jsvectormap.min.css';
    document.head.appendChild(link);
  }
  
  // Add custom tooltip CSS
  const style = document.createElement('style');
  style.textContent = `
    .jvm-tooltip {
      position: absolute;
      display: none;
      background-color: #1F2937 !important;
      color: white !important;
      border-radius: 8px !important;
      padding: 12px !important;
      font-family: inherit !important;
      font-size: 13px !important;
      z-index: 1000 !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      border: 1px solid #374151 !important;
      max-width: 220px !important;
      pointer-events: none !important;
    }
    .jvm-tooltip.active {
      display: block !important;
    }
    .jvm-container {
      position: relative !important;
    }
  `;
  document.head.appendChild(style);
}, []);

  // Load world map on component mount
  useEffect(() => {
    loadWorldMap().then(() => setMapReady(true));
  }, []);
  // -----------------------------
  // FETCH DATA
  // -----------------------------
  // useEffect(() => {
  //   let active = true;

  //   const fetchData = async () => {
  //     setLoading(true);
  //     setError(null);
      
  //     try {
  //       const res = await getSessionsByCountry(range, topN, metric);
  //       const data = res?.data?.rows || [];
  //       console.log(data);

  //       const formatted = data
  //         .map((r) => ({
  //           country: r.country,
  //           iso: r.iso?.toUpperCase(), // Ensure uppercase
  //           value: Number(r.value || 0),
  //         }))
  //         .filter((r) => r.iso && r.value > 0)
  //         .sort((a, b) => b.value - a.value);

  //       if (active) {
  //         setRows(formatted);
  //         console.log(`✓ Loaded ${formatted.length} countries with ${formatted.reduce((s, r) => s + r.value, 0).toLocaleString()} visitors`);
  //       }
  //     } catch (err) {
  //       console.error("❌ Error fetching country data:", err);
  //       if (active) {
  //         setError(err.message || "Failed to load visitor data");
  //         setRows([]);
  //       }
  //     } finally {
  //       if (active) {
  //         setLoading(false);
  //       }
  //     }
  //   };

  //   fetchData();

  //   return () => {
  //     active = false;
  //   };
  // }, [range, metric, topN]);


  // -----------------------------
  // CALCULATIONS
  // -----------------------------
  const maxValue = useMemo(() => {
    return rows.length > 0 ? Math.max(...rows.map((r) => r.value)) : 1;
  }, [rows]);

  const total = useMemo(() => {
    return rows.reduce((s, r) => s + r.value, 0);
  }, [rows]);

  const topRows = useMemo(() => rows.slice(0, 6), [rows]);

  // -----------------------------
  // COLOR GRADIENT (5-TIER)
  // -----------------------------
  const getColorForValue = (value) => {
    if (value === 0) return "#E5E7EB";
    
    const intensity = Math.min(value / maxValue, 1);
    
    if (intensity < 0.2) return "#DBEAFE";
    if (intensity < 0.4) return "#93C5FD";
    if (intensity < 0.6) return "#60A5FA";
    if (intensity < 0.8) return "#3B82F6";
    return "#1E40AF";
  };


  const getIntensityLevel = (value) => {
  if (value === 0) return 0;

  const intensity = Math.min(value / maxValue, 1);

  if (intensity < 0.2) return 1;
  if (intensity < 0.4) return 2;
  if (intensity < 0.6) return 3;
  if (intensity < 0.8) return 4;
  return 5;
};


  // -----------------------------
  // INITIALIZE MAP
  // -----------------------------
  useEffect(() => {
    // Wait for: map library loaded, data ready, container exists
    if (!mapReady || !mapContainerRef.current || loading || rows.length === 0) {
      return;
    }

    // Destroy existing instance
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.destroy();
        console.log("🗑️ Previous map destroyed");
      } catch (e) {
        console.warn("Map destroy warning:", e);
      }
      mapInstanceRef.current = null;
    }

    // Clear container
    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = '';
    }

    // Build values object for heatmap
    const values = {};
    rows.forEach((r) => {
      if (r.iso) {
   values[r.iso] = getIntensityLevel(r.value);

      }
    });

    console.log(`🗺️ Initializing map with ${Object.keys(values).length} countries`);
    console.log("Sample data:", Object.entries(values).slice(0, 3));

    try {
      // Create map instance
      const map = new jsVectorMap({
        selector: mapContainerRef.current,
        map: "world",
        
        // Visual settings
        backgroundColor: "transparent",
        zoomButtons: true,
        zoomOnScroll: false,
        zoomMax: 12,
        zoomMin: 1,
        zoomStep: 1.5,
        
        // Bind data to regions
        bindTouchEvents: true,
        
        // Region styling
        regionStyle: {
          initial: {
            fill: "#E5E7EB",
            fillOpacity: 1,
            stroke: "#FFFFFF",
            strokeWidth: 0.7,
            strokeOpacity: 1,
          },
          hover: {
            fillOpacity: 0.8,
            cursor: "pointer",
            stroke: "#1E40AF",
            strokeWidth: 2,
          },
          selected: {
            fill: "#1E40AF",
          },
          selectedHover: {},
        },
series: {
  regions: [
    {
      values, // { IN: 4, US: 5, AE: 2 }
      scale: [
        "#E5E7EB", // 0 - no data
        "#DBEAFE", // 1 - very low
        "#93C5FD", // 2 - low
        "#60A5FA", // 3 - medium
        "#3B82F6", // 4 - high
        "#1E40AF", // 5 - very high
      ],
      normalizeFunction: "linear",
    },
  ],
},

        // Marker style (not used but required)
        markerStyle: {
          initial: {
            fill: "#3B82F6",
            stroke: "#FFFFFF",
          },
        },

        // Labels
        labels: {
          regions: {
            render: function(code) {
              return "";
            }
          }
        },

        // Tooltip
 onRegionTooltipShow: function (event, tooltip, code) {
  const countryData = rows.find((r) => r.iso === code);

  // ✅ Get full country name from map data
  const fullCountryName =
    this.regions?.[code]?.config?.name || code;

  if (countryData) {
    const pct =
      total > 0 ? ((countryData.value / total) * 100).toFixed(1) : 0;

    tooltip.css({
      backgroundColor: "#1F2937",
      color: "#fff",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "13px",
      fontFamily: "inherit",
    });

    tooltip.text(
      `<div style="min-width: 160px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #F3F4F6;">
          ${fullCountryName}
        </div>
        <div style="font-size: 13px; color: #D1D5DB; margin-bottom: 4px;">
          Visitors: <strong style="color: #60A5FA;">
            ${countryData.value.toLocaleString()}
          </strong>
        </div>
        <div style="font-size: 12px; color: #9CA3AF;">
          ${pct}% of total traffic
        </div>
      </div>`,
      true
    );
  } else {
    tooltip.css({
      backgroundColor: "#374151",
      color: "#9CA3AF",
      borderRadius: "6px",
      padding: "8px",
    });

    tooltip.text(
      `<div style="padding: 4px;">
        <strong style="color: #D1D5DB;">${fullCountryName}</strong><br/>
        <span style="font-size: 12px;">No visitor data</span>
      </div>`,
      true
    );
  }
},


        // CRITICAL: Apply colors after map loads
        // onLoaded: function(map) {
        //   console.log("🎨 Map loaded, applying colors...");
          
        //   // Small delay to ensure DOM is ready
        //   setTimeout(() => {
        //     Object.entries(values).forEach(([code, value]) => {
        //       const color = getColorForValue(value);
        //       const region = map.regions[code];
              
        //       if (region && region.element && region.element.node) {
        //         region.element.node.setAttribute("fill", color);
        //         region.element.node.style.fill = color;
        //       }
        //     });
            
        //     console.log("✓ Heatmap colors applied successfully");
        //   }, 100);
        // },
        
      });

      mapInstanceRef.current = map;
      console.log("✓ Map instance created successfully");
      
    } catch (err) {
      console.error("❌ Map initialization error:", err);
      console.error("Error details:", err.message, err.stack);
      setError("Failed to initialize map visualization. Please refresh the page.");
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          // Silent cleanup
        }
        mapInstanceRef.current = null;
      }
    };
  }, [rows, loading, maxValue, total, mapReady]);

  // -----------------------------
  // RENDER
  // -----------------------------
  const selectedRange = RANGES.find(r => r.key === range);

  return (
    <Card className="shadow-sm">
      {/* HEADER */}
      <CardHeader className="d-flex justify-content-between align-items-center border-bottom py-3">
        <div>
          <CardTitle as="h4" className="mb-1 fw-semibold">
            Visitor Analytics by Country
          </CardTitle>
          <p className="text-muted small mb-0">
            Geographic distribution of website visitors
          </p>
        </div>

        {/* CONTROLS */}
        <div className="d-flex gap-2 align-items-center">
          {/* Range Dropdown */}
          <Dropdown show={dropdownOpen} onToggle={setDropdownOpen}>
            <DropdownToggle
              as="a"
              role="button"
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              disabled={loading}
            >
              <IconifyIcon icon={selectedRange?.icon || "bx:calendar"} />
              <span>{selectedRange?.label || "Select Range"}</span>
              <IconifyIcon icon="bx:chevron-down" className="ms-1" />
            </DropdownToggle>
            
            <DropdownMenu align="end">
              {RANGES.map((r) => (
                <DropdownItem
                  key={r.key}
                  active={range === r.key}
                  onClick={() => {
                    setRange(r.key);
                    setDropdownOpen(false);
                  }}
                  className="d-flex align-items-center gap-2"
                >
                  <IconifyIcon icon={r.icon} />
                  <span>{r.label}</span>
                  {range === r.key && (
                    <IconifyIcon icon="bx:check" className="ms-auto text-primary" />
                  )}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Actions Dropdown */}
          {/* <Dropdown show={actionDropdownOpen} onToggle={setActionDropdownOpen}>
            <DropdownToggle
              as="a"
              role="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center"
              style={{ cursor: 'pointer' }}
            >
              <IconifyIcon icon="bx:dots-vertical-rounded" className="fs-18" />
            </DropdownToggle>
            
            <DropdownMenu align="end">
              <DropdownItem onClick={() => console.log("Download")}>
                <IconifyIcon icon="bx:download" className="me-2" />
                Download Report
              </DropdownItem>
              <DropdownItem onClick={() => console.log("Export")}>
                <IconifyIcon icon="bx:export" className="me-2" />
                Export as CSV
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={() => console.log("Settings")}>
                <IconifyIcon icon="bx:cog" className="me-2" />
                Settings
              </DropdownItem>
            </DropdownMenu>
          </Dropdown> */}
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="m-3 mb-0">
            <IconifyIcon icon="bx:error-circle" className="me-2" />
            {error}
          </Alert>
        )}

        <Row className="g-0">
          {/* MAP SECTION */}
          <Col lg={7} className="border-end position-relative">
            <div className="p-3">
              {/* Map Container */}
              <div 
                ref={mapContainerRef} 
                style={{ 
                  height: "420px", 
                  width: "100%",
                  position: "relative",
                  minHeight: "420px"
                }}
              />
              
              {/* Loading Overlay */}
              {(loading || !mapReady) && (
                <div 
                  className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center gap-2 bg-white p-4 rounded shadow-sm"
                  style={{ zIndex: 10 }}
                >
                  <Spinner animation="border" variant="primary" />
                  <span className="text-muted small">
                    {!mapReady ? "Loading map library..." : "Loading data..."}
                  </span>
                </div>
              )}

              {/* Legend */}
              {!loading && mapReady && rows.length > 0 && (
                <div className="mt-3 d-flex justify-content-center align-items-center gap-3 flex-wrap">
                  <small className="text-muted fw-semibold me-2">Visitor Intensity:</small>
                  {[
                    { color: "#DBEAFE", label: "Very Low" },
                    { color: "#93C5FD", label: "Low" },
                    { color: "#60A5FA", label: "Medium" },
                    { color: "#3B82F6", label: "High" },
                    { color: "#1E40AF", label: "Very High" }
                  ].map((item, i) => (
                    <div key={i} className="d-flex align-items-center gap-1">
                      <div 
                        style={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: item.color,
                          border: "1px solid #ccc",
                          borderRadius: 2
                        }} 
                      />
                      <small className="text-muted">{item.label}</small>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && mapReady && rows.length === 0 && !error && (
                <div className="text-center py-5">
                  <IconifyIcon icon="bx:world" style={{ fontSize: '48px' }} className="text-muted mb-3" />
                  <h5 className="text-muted">No visitor data available</h5>
                  <p className="text-muted small">Try selecting a different time range</p>
                </div>
              )}
            </div>
          </Col>

          {/* TOP COUNTRIES LIST */}
          <Col lg={5}>
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold mb-0">Top Countries</h5>
                <small className="text-muted">
                  {total.toLocaleString()} total visitors
                </small>
              </div>

              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <p className="text-muted mt-2 mb-0 small">Loading statistics...</p>
                </div>
              )}

              {!loading && topRows.length === 0 && !error && (
                <div className="text-center py-5">
                  <IconifyIcon icon="bx:info-circle" style={{ fontSize: '32px' }} className="text-muted mb-2" />
                  <p className="text-muted mb-0 small">No data to display</p>
                </div>
              )}

              {!loading && topRows.map((r, i) => {
                const pctOfMax = maxValue ? Math.round((r.value / maxValue) * 100) : 0;
                const totalPct = total ? ((r.value / total) * 100).toFixed(1) : 0;
                const color = getColorForValue(r.value);

                return (
                  <Fragment key={r.iso || i}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-dark" style={{ minWidth: '24px' }}>
                          #{i + 1}
                        </span>
                        {renderFlag(r.iso)}
                        <span className="fw-medium">{r.country}</span>
                      </div>
                      <span className="fw-semibold text-primary">
                        {r.value.toLocaleString()}
                      </span>
                    </div>

                    <Row className={`align-items-center ${i === topRows.length - 1 ? "mb-0" : "mb-4"}`}>
                      <Col>
                        <ProgressBar style={{ height: 8 }} className="rounded">
                          <ProgressBar
                            now={pctOfMax}
                            style={{ 
                              backgroundColor: color,
                              transition: 'width 0.6s ease'
                            }}
                          />
                        </ProgressBar>
                      </Col>
                      <Col xs="auto" style={{ minWidth: '60px' }}>
                        <span className="fw-semibold small text-muted">
                          {totalPct}%
                        </span>
                      </Col>
                    </Row>
                  </Fragment>
                );
              })}

              {!loading && rows.length > 6 && (
                <div className="text-center mt-4 pt-3 border-top">
                  <Button 
                    variant="link" 
                    size="sm"
                    className="text-decoration-none"
                    onClick={() => console.log("View all")}
                  >
                    View all {rows.length} countries
                    <IconifyIcon icon="bx:chevron-right" className="ms-1" />
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}