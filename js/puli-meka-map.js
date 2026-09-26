(function () {
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 500;

  const PARCHMENT_SHADES = [
    '#ecdcbf',
    '#f2e2c5',
    '#ebd6b0',
    '#f5e6cd',
    '#e9d5b2',
    '#eedbbd'
  ];

  const PULI_MEKA_LOCATIONS = [
    {
      name: "Puli Meka",
      region: "Andhra Pradesh & Telangana, India",
      latitude: 17.3850,
      longitude: 78.4867,
      description:
        "A traditional strategy game where one player controls tigers and the other controls goats, with tigers trying to capture goats while goats work together to block them.",
      isPrimary: true
    },
    {
      name: "Aadu Puli Aattam",
      region: "Tamil Nadu, India",
      latitude: 13.0827,
      longitude: 80.2707,
      description:
        "A traditional Tamil strategy game featuring tigers and goats, where players use positioning and teamwork to outmaneuver their opponents."
    },
    {
      name: "Pulijudam",
      region: "Kerala, India",
      latitude: 10.1632,
      longitude: 76.6413,
      description:
        "A traditional Kerala tiger-and-goat game where the tiger attempts to capture the goats while the goats try to surround and restrict its movement."
    },
    {
      name: "Bagh Chal",
      region: "Nepal",
      latitude: 27.7172,
      longitude: 85.3240,
      description:
        "A famous Nepali strategy game in which four tigers hunt twenty goats, while the goats cooperate to trap the tigers."
    },
    {
      name: "Pulijudam",
      region: "Sri Lanka",
      latitude: 7.8731,
      longitude: 80.7718,
      description:
        "A traditional tiger-and-goat strategy game where players use careful positioning to capture or block their opponent's pieces."
    },
    {
      name: "Main Macan",
      region: "Indonesia",
      latitude: -6.2088,
      longitude: 106.8456,
      description:
        "A traditional tiger-and-prey strategy game where players use tactical movement, with the tiger capturing pieces while the opposing side attempts to restrict it."
    }
  ];

  window.initPuliMekaWorldMap = function (container) {
    if (!container) return;
    container.innerHTML = '';

    // Create shell wrapper matching ZIP structure
    const shell = document.createElement('div');
    shell.className = 'pm-map-shell relative w-full h-full overflow-hidden select-none bg-[#19585e] border-[3px] border-[#3f1911] rounded-xl shadow-2xl cursor-grab active:cursor-grabbing touch-none';
    shell.style.position = 'relative';
    shell.style.width = '100%';
    shell.style.height = '100%';
    shell.style.overflow = 'hidden';
    shell.style.userSelect = 'none';
    shell.style.webkitUserSelect = 'none';
    shell.style.backgroundColor = '#19585e';
    shell.style.border = '3px solid #3f1911';
    shell.style.borderRadius = '12px';
    shell.style.boxShadow = '0 12px 36px -4px rgba(22, 10, 6, 0.45), inset 0 0 24px rgba(10, 24, 26, 0.55)';
    shell.style.cursor = 'grab';
    shell.style.touchAction = 'none';

    container.appendChild(shell);

    let zoom = 1;
    let pan = { x: 0, y: 0 };
    let isDragging = false;
    let dragStart = { x: 0, y: 0, panX: 0, panY: 0 };
    let hasDragged = false;
    let hoveredLocation = null;

    const touchPointers = new Map();
    let pinchStartDist = null;
    let pinchStartZoom = 1;

    // D3 Projection: Scale factor 1.30x and Y translate shifted down +45px to crop Antarctica and fill populated land
    const projection = d3.geoEquirectangular()
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2 + 45])
      .scale((MAP_WIDTH / (2 * Math.PI)) * 1.30);

    const pathGenerator = d3.geoPath().projection(projection);

    const topo = window.WORLD_ATLAS_DATA;
    if (!topo) {
      console.error('World Atlas data missing!');
      return;
    }

    const countriesGeo = topojson.feature(topo, topo.objects.countries);
    const bordersMesh = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);

    const countryFeatures = countriesGeo.features.map((feature, idx) => ({
      d: pathGenerator(feature) || '',
      id: feature.id || idx,
      fill: PARCHMENT_SHADES[idx % PARCHMENT_SHADES.length],
    }));

    const borderD = pathGenerator(bordersMesh) || '';

    const graticule = d3.geoGraticule().step([30, 20])();
    const gratD = pathGenerator(graticule) || '';

    const equatorGeo = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-180, 0],
          [-90, 0],
          [0, 0],
          [90, 0],
          [180, 0]
        ]
      }
    };
    const eqD = pathGenerator(equatorGeo) || '';

    const tropicsGeo = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [-180, 23.4368],
              [0, 23.4368],
              [180, 23.4368]
            ]
          }
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [-180, -23.4368],
              [0, -23.4368],
              [180, -23.4368]
            ]
          }
        }
      ]
    };
    const trD = pathGenerator(tropicsGeo) || '';

    const projectedLocations = PULI_MEKA_LOCATIONS.map(loc => {
      const coords = projection([loc.longitude, loc.latitude]);
      return {
        ...loc,
        x: coords ? coords[0] : 0,
        y: coords ? coords[1] : 0,
        isValid: coords !== null
      };
    }).filter(loc => loc.isValid);

    // Create SVG element
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgNode.setAttribute('viewBox', `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`);
    svgNode.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgNode.style.width = '100%';
    svgNode.style.height = '100%';
    svgNode.style.display = 'block';

    const countryPathsHtml = countryFeatures.map(c =>
      `<path d="${c.d}" fill="${c.fill}" stroke="#543722" stroke-width="0.9" stroke-linejoin="round" />`
    ).join('');

    svgNode.innerHTML = `
      <defs>
        <radialGradient id="ocean-radial" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stop-color="#1e646a" />
          <stop offset="70%" stop-color="#18565c" />
          <stop offset="100%" stop-color="#13474c" />
        </radialGradient>

        <radialGradient id="pin-gold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#f8c146" />
          <stop offset="50%" stop-color="#e5981d" />
          <stop offset="100%" stop-color="#b6710a" />
        </radialGradient>

        <radialGradient id="pin-primary" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ff7a26" />
          <stop offset="55%" stop-color="#e04c0a" />
          <stop offset="100%" stop-color="#a33203" />
        </radialGradient>

        <filter id="pin-drop-shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#180b05" flood-opacity="0.45" />
        </filter>

        <radialGradient id="ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1a0c06" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#1a0c06" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="url(#ocean-radial)" />

      <g id="pm-map-zoom-group">
        <path d="${gratD}" fill="none" stroke="#e4d4ba" stroke-width="0.75" stroke-opacity="0.22" />
        <path d="${trD}" fill="none" stroke="#dcc5a2" stroke-width="0.8" stroke-dasharray="3,3" stroke-opacity="0.28" />
        <path d="${eqD}" fill="none" stroke="#dfceb0" stroke-width="1.2" stroke-opacity="0.38" />
        <g id="pm-world-countries">${countryPathsHtml}</g>
        <path d="${borderD}" fill="none" stroke="#785942" stroke-width="0.65" stroke-linejoin="round" stroke-dasharray="1.5,0.8" stroke-opacity="0.85" />
        <g id="pm-map-pins-group"></g>
      </g>
    `;

    shell.appendChild(svgNode);

    const zoomGroup = svgNode.querySelector('#pm-map-zoom-group');
    const pinsGroup = svgNode.querySelector('#pm-map-pins-group');

    // Floating Tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'pm-map-tooltip-container';
    tooltipContainer.style.position = 'absolute';
    tooltipContainer.style.zIndex = '30';
    tooltipContainer.style.pointerEvents = 'none';
    tooltipContainer.style.transition = 'all 200ms ease-out';
    tooltipContainer.style.display = 'none';
    shell.appendChild(tooltipContainer);

    function updateTransform() {
      zoomGroup.setAttribute(
        'transform',
        `translate(${MAP_WIDTH / 2 + pan.x}, ${MAP_HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-MAP_WIDTH / 2}, ${-MAP_HEIGHT / 2})`
      );
      renderPins();
      renderTooltip();
    }

    function renderPins() {
      pinsGroup.innerHTML = '';
      projectedLocations.forEach(loc => {
        const isHovered = hoveredLocation?.name === loc.name;
        const isPrimary = Boolean(loc.isPrimary);

        const pinScale = (isHovered ? 1.25 : 1) / Math.sqrt(zoom);

        const gPin = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gPin.setAttribute('transform', `translate(${loc.x}, ${loc.y}) scale(${pinScale})`);
        gPin.style.cursor = 'pointer';
        gPin.style.transition = 'transform 150ms ease-out';
        gPin.setAttribute('role', 'button');
        gPin.setAttribute('tabindex', '0');
        gPin.setAttribute('aria-label', `${loc.name}, ${loc.region || ''}`);

        gPin.innerHTML = `
          <ellipse cx="0" cy="1.5" rx="5" ry="2.2" fill="url(#ground-shadow)" />
          <g filter="url(#pin-drop-shadow)">
            <path d="M 0 0 C -4.5 -6 -9 -11.5 -9 -17 A 9 9 0 1 1 9 -17 C 9 -11.5 4.5 -6 0 0 Z"
                  fill="${isPrimary ? 'url(#pin-primary)' : 'url(#pin-gold)'}"
                  stroke="#3b150c" stroke-width="2.2" stroke-linejoin="round" />
            ${isPrimary ? `
              <g transform="translate(0, -17)">
                <circle cx="0" cy="0" r="3.6" fill="#fff9eb" stroke="#3b150c" stroke-width="1.2" />
                <path d="M 0 -2.4 L 0.7 -0.7 L 2.4 0 L 0.7 0.7 L 0 2.4 L -0.7 0.7 L -2.4 0 L -0.7 -0.7 Z" fill="#d97706" />
              </g>
            ` : `
              <circle cx="0" cy="-17" r="3.2" fill="#fff9eb" stroke="#3b150c" stroke-width="1.2" />
            `}
          </g>
          <rect x="-16" y="-30" width="32" height="34" fill="transparent" />
        `;

        gPin.addEventListener('mouseenter', () => {
          hoveredLocation = loc;
          renderPins();
          renderTooltip();
        });

        gPin.addEventListener('mouseleave', () => {
          hoveredLocation = null;
          renderPins();
          renderTooltip();
        });

        gPin.addEventListener('focus', () => {
          hoveredLocation = loc;
          renderPins();
          renderTooltip();
        });

        gPin.addEventListener('blur', () => {
          hoveredLocation = null;
          renderPins();
          renderTooltip();
        });

        pinsGroup.appendChild(gPin);
      });
    }

    function renderTooltip() {
      if (!hoveredLocation) {
        tooltipContainer.style.display = 'none';
        return;
      }

      const projectedLoc = projectedLocations.find(l => l.name === hoveredLocation.name);
      if (!projectedLoc) {
        tooltipContainer.style.display = 'none';
        return;
      }

      const px = projectedLoc.x;
      const py = projectedLoc.y;

      const transformedX = (px - MAP_WIDTH / 2) * zoom + MAP_WIDTH / 2 + pan.x;
      const transformedY = (py - MAP_HEIGHT / 2) * zoom + MAP_HEIGHT / 2 + pan.y;

      const leftPercent = (transformedX / MAP_WIDTH) * 100;
      const topPercent = (transformedY / MAP_HEIGHT) * 100;

      const translateX = transformedX > MAP_WIDTH * 0.75
        ? '-90%'
        : transformedX < MAP_WIDTH * 0.25
        ? '-10%'
        : '-50%';

      const translateY = transformedY < MAP_HEIGHT * 0.28
        ? '14px'
        : 'calc(-100% - 24px)';

      const notchTop = transformedY < MAP_HEIGHT * 0.28;
      const notchLeft = transformedX > MAP_WIDTH * 0.75
        ? '85%'
        : transformedX < MAP_WIDTH * 0.25
        ? '15%'
        : '50%';

      const isPrimary = Boolean(hoveredLocation.isPrimary);

      tooltipContainer.style.display = 'block';
      tooltipContainer.style.left = `${leftPercent}%`;
      tooltipContainer.style.top = `${topPercent}%`;
      tooltipContainer.style.transform = `translate(${translateX}, ${translateY})`;

      tooltipContainer.innerHTML = `
        <div style="width: 270px; background-color: #fbf5e8; border: 1.5px solid #4a2414; border-radius: 8px; padding: 14px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); position: relative; text-align: left; background-image: radial-gradient(ellipse at top left, #fffdf8, #f5ebd3);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
            <h4 class="font-cartography" style="font-weight: 700; font-size: 16px; color: #2e1408; line-height: 1.25; margin: 0;">
              ${hoveredLocation.name}
            </h4>
            ${isPrimary ? `
              <span style="font-size: 10px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; background-color: #ebd7a7; border: 1px solid #a67c48; color: #5c3810;">
                Origin
              </span>
            ` : ''}
          </div>

          ${hoveredLocation.region ? `
            <p class="font-antique" style="font-size: 12px; font-weight: 500; color: #7a4c28; margin: 0 0 8px 0;">
              ${hoveredLocation.region}
            </p>
          ` : ''}

          <div style="width: 100%; height: 1px; background: linear-gradient(to right, transparent, rgba(140, 93, 51, 0.5), transparent); margin: 6px 0;"></div>

          <p class="font-antique" style="font-size: 12px; color: #3e2417; line-height: 1.6; margin: 0;">
            ${hoveredLocation.description}
          </p>

          <div style="position: absolute; width: 10px; height: 10px; background-color: #f5ebd3; transform: rotate(45deg); ${notchTop ? '-top: 6px; border-top: 1.5px solid #4a2414; border-left: 1.5px solid #4a2414;' : '-bottom: 6px; border-bottom: 1.5px solid #4a2414; border-right: 1.5px solid #4a2414;'} left: ${notchLeft}; margin-left: -5px;"></div>
        </div>
      `;
    }

    // Event Handlers for Wheel Zoom, Double Click, Drag, Pinch
    shell.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 1), 6);
      zoom = newZoom;
      if (zoom === 1) pan = { x: 0, y: 0 };
      updateTransform();
    }, { passive: false });

    shell.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (zoom > 1.2) {
        zoom = 1;
        pan = { x: 0, y: 0 };
      } else {
        zoom = 2.2;
      }
      updateTransform();
    });

    shell.addEventListener('pointerdown', (e) => {
      touchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (touchPointers.size === 1) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isDragging = true;
        hasDragged = false;
        dragStart = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
        shell.style.cursor = 'grabbing';
      } else if (touchPointers.size === 2) {
        const points = Array.from(touchPointers.values());
        pinchStartDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        pinchStartZoom = zoom;
        isDragging = false;
      }
    });

    shell.addEventListener('pointermove', (e) => {
      if (!touchPointers.has(e.pointerId)) return;
      touchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (touchPointers.size === 2 && pinchStartDist) {
        hasDragged = true;
        const points = Array.from(touchPointers.values());
        const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const ratio = dist / pinchStartDist;
        const newZoom = Math.min(Math.max(pinchStartZoom * ratio, 1), 6);
        zoom = newZoom;
        if (zoom === 1) pan = { x: 0, y: 0 };
        updateTransform();
        return;
      }

      if (isDragging && touchPointers.size === 1) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasDragged = true;
        }

        const maxPanX = (MAP_WIDTH * (zoom - 1)) / 2;
        const maxPanY = (MAP_HEIGHT * (zoom - 1)) / 2;

        const scale = container.clientWidth ? container.clientWidth / MAP_WIDTH : 1;
        const newX = Math.min(Math.max(dragStart.panX + dx / scale, -maxPanX), maxPanX);
        const newY = Math.min(Math.max(dragStart.panY + dy / scale, -maxPanY), maxPanY);

        pan = { x: newX, y: newY };
        updateTransform();
      }
    });

    function handlePointerEnd(e) {
      touchPointers.delete(e.pointerId);
      if (touchPointers.size < 2) pinchStartDist = null;
      if (touchPointers.size === 0) {
        isDragging = false;
        shell.style.cursor = 'grab';
      }
    }

    shell.addEventListener('pointerup', handlePointerEnd);
    shell.addEventListener('pointercancel', handlePointerEnd);
    shell.addEventListener('pointerleave', handlePointerEnd);

    updateTransform();
  };
})();
