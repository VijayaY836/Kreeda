(function () {
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 500;

  const PARCHMENT_SHADES = [
    '#ebdab6',
    '#f0e1c2',
    '#e7d5ad',
    '#ebd9b5',
    '#f2e3c6',
    '#e4d1a7'
  ];

  const VAMANA_LOCATIONS = [
    {
      name: "Vamana Guntalu",
      region: "Andhra Pradesh & Telangana, India",
      latitude: 17.3850,
      longitude: 78.4867,
      description:
        "A traditional South Indian counting game played with seeds or shells in small pits, combining counting, strategy, and planning.",
      isPrimary: true
    },
    {
      name: "Pallanguzhi",
      region: "Tamil Nadu, India",
      latitude: 13.0827,
      longitude: 80.2707,
      description:
        "A traditional Tamil mancala game where players distribute seeds across pits and capture them through careful counting and strategy.",
      color: "#eab308"
    },
    {
      name: "Ali Guli Mane",
      region: "Karnataka, India",
      latitude: 12.9716,
      longitude: 77.5946,
      description:
        "A traditional Kannada game played with seeds in a wooden board of pits, requiring strategic distribution and collection.",
      color: "#eab308"
    },
    {
      name: "Ayo",
      region: "Nigeria",
      latitude: 9.0765,
      longitude: 7.3986,
      description:
        "A traditional Nigerian mancala game in which players distribute seeds among pits and capture them through strategic moves.",
      color: "#c2410c"
    },
    {
      name: "Oware",
      region: "Ghana",
      latitude: 5.6037,
      longitude: -0.1870,
      description:
        "A popular West African mancala game where players sow and capture seeds while planning their moves carefully.",
      color: "#c2410c"
    },
    {
      name: "Congklak",
      region: "Indonesia",
      latitude: -6.2088,
      longitude: 106.8456,
      description:
        "A traditional Indonesian mancala game where players move shells or seeds between pits and aim to collect the most pieces.",
      color: "#d97706"
    }
  ];

  window.initVamanaGuntaluWorldMap = function (container) {
    if (!container) return;
    container.innerHTML = '';

    // Shell wrapper matching ZIP structure
    const shell = document.createElement('div');
    shell.className = 'vg-map-shell relative w-full h-full overflow-hidden select-none bg-[#154e52] border-[3px] border-[#381c0d] rounded-xl shadow-2xl cursor-grab active:cursor-grabbing touch-none';
    shell.style.position = 'relative';
    shell.style.width = '100%';
    shell.style.height = '100%';
    shell.style.overflow = 'hidden';
    shell.style.userSelect = 'none';
    shell.style.webkitUserSelect = 'none';
    shell.style.backgroundColor = '#154e52';
    shell.style.border = '3px solid #381c0d';
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
    const coastlinesMesh = topojson.mesh(topo, topo.objects.land, (a, b) => a === b);

    const countryFeatures = countriesGeo.features.map((feature, idx) => ({
      d: pathGenerator(feature) || '',
      id: feature.id || idx,
      fill: PARCHMENT_SHADES[idx % PARCHMENT_SHADES.length]
    }));

    const borderD = pathGenerator(bordersMesh) || '';
    const coastD = pathGenerator(coastlinesMesh) || '';

    const graticule = d3.geoGraticule().step([30, 15])();
    const gratD = pathGenerator(graticule) || '';

    const equatorGeo = {
      type: 'LineString',
      coordinates: [
        [-180, 0],
        [-90, 0],
        [0, 0],
        [90, 0],
        [180, 0]
      ]
    };
    const eqD = pathGenerator(equatorGeo) || '';

    const projectedLocations = VAMANA_LOCATIONS.map(loc => {
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
      `<path d="${c.d}" fill="${c.fill}" fill-opacity="0.96" />`
    ).join('');

    svgNode.innerHTML = `
      <defs>
        <filter id="pinShadow" x="-50%" y="-40%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#120803" flood-opacity="0.55" />
        </filter>
      </defs>

      <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#154e52" />

      <g id="vg-map-zoom-group">
        <path d="${gratD}" fill="none" stroke="#eddcb9" stroke-width="0.65" stroke-opacity="0.22" />
        <path d="${eqD}" fill="none" stroke="#eddcb9" stroke-width="1.2" stroke-opacity="0.42" />
        <g id="vg-world-countries">${countryPathsHtml}</g>
        <path d="${borderD}" fill="none" stroke="#63452a" stroke-width="0.65" stroke-opacity="0.55" stroke-linejoin="round" />
        <path d="${coastD}" fill="none" stroke="#52361e" stroke-width="0.85" stroke-opacity="0.85" stroke-linejoin="round" />
        <g id="vg-map-pins-group"></g>
      </g>

      <rect x="3" y="3" width="${MAP_WIDTH - 6}" height="${MAP_HEIGHT - 6}" rx="12" fill="none" stroke="#4a2815" stroke-width="1.2" stroke-opacity="0.45" pointer-events="none" />
    `;

    shell.appendChild(svgNode);

    const zoomGroup = svgNode.querySelector('#vg-map-zoom-group');
    const pinsGroup = svgNode.querySelector('#vg-map-pins-group');

    // Floating Tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'vg-map-tooltip-container';
    tooltipContainer.style.position = 'absolute';
    tooltipContainer.style.zIndex = '30';
    tooltipContainer.style.pointerEvents = 'none';
    tooltipContainer.style.transition = 'opacity 160ms ease-out, visibility 160ms ease-out';
    tooltipContainer.style.opacity = '0';
    tooltipContainer.style.visibility = 'hidden';
    shell.appendChild(tooltipContainer);

    function updateTransform() {
      zoomGroup.setAttribute(
        'transform',
        `translate(${MAP_WIDTH / 2 + pan.x}, ${MAP_HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-MAP_WIDTH / 2}, ${-MAP_HEIGHT / 2})`
      );
      updatePinVisuals();
      renderTooltip();
    }

    function renderPins() {
      pinsGroup.innerHTML = '';
      projectedLocations.forEach(loc => {
        const isHovered = hoveredLocation?.name === loc.name;
        const isPrimary = Boolean(loc.isPrimary);

        const pinScale = (isHovered ? 1.25 : 1) / Math.pow(zoom, 0.5);

        const gPin = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gPin.setAttribute('data-loc-name', loc.name);
        gPin.setAttribute('transform', `translate(${loc.x}, ${loc.y}) scale(${pinScale})`);
        gPin.style.cursor = 'pointer';
        gPin.style.transition = 'transform 150ms ease-out';
        gPin.setAttribute('role', 'button');
        gPin.setAttribute('tabindex', '0');
        gPin.setAttribute('aria-label', `${loc.name}, ${loc.region || ''}`);

        const pinFill = isPrimary
          ? '#f59e0b'
          : (loc.color || '#d97706');
        const pipFill = isPrimary ? '#991b1b' : '#fff8e7';

        gPin.innerHTML = `
          <ellipse cx="0" cy="1" rx="4.5" ry="1.8" fill="#130804" opacity="0.4" />
          ${isPrimary ? `
            <circle cx="0" cy="-19" r="13.5" fill="#f59e0b" fill-opacity="0.22" stroke="#f59e0b" stroke-width="0.75" stroke-opacity="0.45" />
          ` : ''}
          <g filter="url(#pinShadow)">
            <circle class="pin-hover-ring" cx="0" cy="-19" r="12.5" fill="none" stroke="#220e04" stroke-width="1.5" stroke-dasharray="2.5 1.5" opacity="${isHovered ? '1' : '0'}" />
            <path class="pin-main-path" d="M 0,0 C -3,-3 -10,-12 -10,-19 A 10,10 0 1,1 10,-19 C 10,-12 3,-3 0,0 Z"
                  fill="${pinFill}" stroke="${isHovered ? '#140601' : '#33180a'}" stroke-width="${isHovered ? '2.0' : isPrimary ? '1.8' : '1.5'}" stroke-linejoin="round" />
            ${isPrimary ? `
              <circle cx="0" cy="-19" r="6.5" fill="none" stroke="#fef08a" stroke-width="1.2" />
            ` : ''}
            <circle cx="0" cy="-19" r="${isPrimary ? 3.5 : 3.2}" fill="${pipFill}" stroke="#33180a" stroke-width="1.0" />
          </g>
          <rect x="-16" y="-32" width="32" height="36" fill="transparent" />
        `;

        gPin.addEventListener('mouseenter', () => {
          hoveredLocation = loc;
          updatePinVisuals();
          renderTooltip();
        });

        gPin.addEventListener('mouseleave', () => {
          if (hoveredLocation === loc) {
            hoveredLocation = null;
            updatePinVisuals();
            renderTooltip();
          }
        });

        gPin.addEventListener('focus', () => {
          hoveredLocation = loc;
          updatePinVisuals();
          renderTooltip();
        });

        gPin.addEventListener('blur', () => {
          if (hoveredLocation === loc) {
            hoveredLocation = null;
            updatePinVisuals();
            renderTooltip();
          }
        });

        pinsGroup.appendChild(gPin);
      });
    }

    function updatePinVisuals() {
      Array.from(pinsGroup.children).forEach(gPin => {
        const name = gPin.getAttribute('data-loc-name');
        const isHovered = hoveredLocation?.name === name;
        const loc = projectedLocations.find(l => l.name === name);
        if (!loc) return;
        const pinScale = (isHovered ? 1.25 : 1) / Math.pow(zoom, 0.5);
        gPin.setAttribute('transform', `translate(${loc.x}, ${loc.y}) scale(${pinScale})`);
        const hoverRing = gPin.querySelector('.pin-hover-ring');
        if (hoverRing) hoverRing.setAttribute('opacity', isHovered ? '1' : '0');
        const mainPath = gPin.querySelector('.pin-main-path');
        if (mainPath) {
          mainPath.setAttribute('stroke', isHovered ? '#140601' : '#33180a');
          mainPath.setAttribute('stroke-width', isHovered ? '2.0' : (loc.isPrimary ? '1.8' : '1.5'));
        }
      });
    }

    shell.addEventListener('mouseleave', () => {
      if (hoveredLocation) {
        hoveredLocation = null;
        updatePinVisuals();
        renderTooltip();
      }
    });

    function renderTooltip() {
      if (!hoveredLocation) {
        tooltipContainer.style.opacity = '0';
        tooltipContainer.style.visibility = 'hidden';
        return;
      }

      const projectedLoc = projectedLocations.find(l => l.name === hoveredLocation.name);
      if (!projectedLoc) {
        tooltipContainer.style.opacity = '0';
        tooltipContainer.style.visibility = 'hidden';
        return;
      }

      const shellWidth = shell.clientWidth || MAP_WIDTH;
      const shellHeight = shell.clientHeight || MAP_HEIGHT;

      const px = projectedLoc.x;
      const py = projectedLoc.y;

      const transformedX = (px - MAP_WIDTH / 2) * zoom + MAP_WIDTH / 2 + pan.x;
      const transformedY = (py - MAP_HEIGHT / 2) * zoom + MAP_HEIGHT / 2 + pan.y;

      const pinX = (transformedX / MAP_WIDTH) * shellWidth;
      const pinY = (transformedY / MAP_HEIGHT) * shellHeight;

      const isPrimary = Boolean(hoveredLocation.isPrimary);

      tooltipContainer.style.left = '0px';
      tooltipContainer.style.top = '0px';
      tooltipContainer.style.transform = 'none';

      tooltipContainer.innerHTML = `
        <div style="width: 280px; max-width: 85vw; background-color: #faf2de; border: 1.5px solid #4a2e18; border-radius: 12px; padding: 14px; box-shadow: 0 8px 24px rgba(20,10,4,0.35); position: relative; text-align: left; color: #2d180b; pointer-events: none;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid rgba(74, 46, 24, 0.25); padding-bottom: 6px;">
            <h4 class="font-serif font-bold text-sm tracking-wide text-[#33180a] uppercase leading-tight" style="margin: 0;">
              ${hoveredLocation.name}
            </h4>
            ${isPrimary ? `
              <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; background-color: #f5e2b8; border: 1px solid rgba(153, 27, 27, 0.3); color: #991b1b; text-transform: uppercase;">
                Primary
              </span>
            ` : ''}
          </div>

          ${hoveredLocation.region ? `
            <p style="font-size: 12px; font-style: italic; color: #784824; margin: 0 0 8px 0; font-family: serif;">
              ${hoveredLocation.region}
            </p>
          ` : ''}

          <p style="font-size: 12px; color: #3b2314; line-height: 1.6; margin: 0; font-family: serif;">
            ${hoveredLocation.description}
          </p>

          <div class="vg-tooltip-notch" style="position: absolute; width: 10px; height: 10px; background-color: #faf2de; transform: rotate(45deg); pointer-events: none;"></div>
        </div>
      `;

      const cardWidth = tooltipContainer.offsetWidth;
      const cardHeight = tooltipContainer.offsetHeight;

      const margin = 8;
      const pinOffset = 16;

      let isBelow = false;
      let top = pinY - cardHeight - pinOffset;
      if (top < margin) {
        top = pinY + pinOffset;
        isBelow = true;
      }
      top = Math.max(margin, Math.min(top, shellHeight - cardHeight - margin));

      let left = pinX - cardWidth / 2;
      left = Math.max(margin, Math.min(left, shellWidth - cardWidth - margin));

      tooltipContainer.style.left = `${left}px`;
      tooltipContainer.style.top = `${top}px`;
      tooltipContainer.style.visibility = 'visible';
      tooltipContainer.style.opacity = '1';

      const notchEl = tooltipContainer.querySelector('.vg-tooltip-notch');
      if (notchEl) {
        const notchLeftPx = Math.max(16, Math.min(cardWidth - 16, pinX - left));
        const notchStyle = isBelow
          ? '-top: 6px; border-top: 1.5px solid #4a2e18; border-left: 1.5px solid #4a2e18;'
          : '-bottom: 6px; border-bottom: 1.5px solid #4a2e18; border-right: 1.5px solid #4a2e18;';
        notchEl.style.cssText = `position: absolute; width: 10px; height: 10px; background-color: #faf2de; transform: rotate(45deg); ${notchStyle} left: ${notchLeftPx}px; margin-left: -5px; pointer-events: none;`;
      }
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

    renderPins();
    updateTransform();
  };
})();
