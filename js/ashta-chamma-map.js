(function () {
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 500;

  const PARCHMENT_TINTS = [
    '#EBDCB9',
    '#E8D7B3',
    '#E5D3AD',
    '#ECE0C3',
    '#E6D5B1',
    '#EADAB9',
    '#E3D1AC'
  ];

  const ASHTA_CHAMMA_LOCATIONS = [
    {
      name: "Ashta Chamma",
      region: "Telangana, India",
      latitude: 17.3850,
      longitude: 78.4867,
      description:
        "A popular traditional game in Telangana where players move their pieces according to cowrie-shell throws and try to reach the finish before their opponents.",
      isPrimary: true
    },
    {
      name: "Bagha Chal",
      region: "Nepal",
      latitude: 27.7172,
      longitude: 85.3240,
      description:
        "A traditional Nepali strategy game where goats attempt to evade and surround tigers, creating a battle of strategy and positioning."
    },
    {
      name: "Chowka Bhara",
      region: "Karnataka, India",
      latitude: 12.9716,
      longitude: 77.5946,
      description:
        "A traditional Karnataka board game similar to Ashta Chamma, where players use cowrie shells to move their pieces around a cross-shaped board."
    },
    {
      name: "Pachisi",
      region: "Maharashtra, India",
      latitude: 19.0760,
      longitude: 72.8777,
      description:
        "A classic Indian race game in which players move their pieces around a cross-shaped board, combining luck with strategic movement."
    },
    {
      name: "Ludo",
      region: "United Kingdom",
      latitude: 51.5074,
      longitude: -0.1278,
      description:
        "A globally popular, simplified commercial derivative of the traditional cross-and-circle race-game family."
    },
    {
      name: "Parchís",
      region: "Spain",
      latitude: 40.4168,
      longitude: -3.7038,
      description:
        "A popular Spanish adaptation of the Indian Pachisi tradition, played with a standard die."
    }
  ];

  window.initAshtaChammaWorldMap = function (container) {
    if (!container) return;
    container.innerHTML = '';

    // Create wrapper shell matching ZIP structure
    const shell = document.createElement('div');
    shell.className = 'ac-map-shell relative w-full h-full overflow-hidden select-none bg-[#154D53] border-[3px] border-[#482410] rounded-xl shadow-2xl cursor-grab active:cursor-grabbing touch-none';
    shell.style.position = 'relative';
    shell.style.width = '100%';
    shell.style.height = '100%';
    shell.style.overflow = 'hidden';
    shell.style.userSelect = 'none';
    shell.style.webkitUserSelect = 'none';
    shell.style.backgroundColor = '#154D53';
    shell.style.border = '3px solid #482410';
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
    const landFeature = topojson.feature(topo, topo.objects.land);

    const countryFeatures = countriesGeo.features.map((feature, idx) => ({
      d: pathGenerator(feature) || '',
      id: feature.id || idx,
      fill: PARCHMENT_TINTS[Math.abs(Number(feature.id || idx * 7)) % PARCHMENT_TINTS.length],
    }));

    const borderPathD = pathGenerator(bordersMesh) || '';
    const landOutlineD = pathGenerator(landFeature) || '';

    const graticule = d3.geoGraticule().step([15, 15])();
    const gratD = pathGenerator(graticule) || '';

    const equatorGeo = {
      type: 'LineString',
      coordinates: [[-180, 0], [180, 0]]
    };
    const eqD = pathGenerator(equatorGeo) || '';

    const projectedLocations = ASHTA_CHAMMA_LOCATIONS.map(loc => {
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
      `<path d="${c.d}" fill="${c.fill}" />`
    ).join('');

    svgNode.innerHTML = `
      <defs>
        <filter id="antique-pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#1A0D05" flood-opacity="0.45" />
        </filter>

        <filter id="active-pin-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#F5A623" flood-opacity="0.6" />
        </filter>
      </defs>

      <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#154D53" />

      <g id="ac-map-zoom-group">
        <path d="${gratD}" fill="none" stroke="#256166" stroke-width="0.65" stroke-opacity="0.6" />
        <g id="ac-world-countries">${countryPathsHtml}</g>
        <path d="${gratD}" fill="none" stroke="#D4C19A" stroke-width="0.5" stroke-opacity="0.45" />
        <path d="${eqD}" fill="none" stroke="#2C6F76" stroke-width="1.2" stroke-opacity="0.8" />
        <path d="${borderPathD}" fill="none" stroke="#7D5D42" stroke-width="0.65" stroke-linejoin="round" stroke-linecap="round" stroke-opacity="0.85" />
        <path d="${landOutlineD}" fill="none" stroke="#684B31" stroke-width="0.75" stroke-linejoin="round" stroke-linecap="round" />
        <g id="ac-map-pins-group"></g>
      </g>
    `;

    shell.appendChild(svgNode);

    const zoomGroup = svgNode.querySelector('#ac-map-zoom-group');
    const pinsGroup = svgNode.querySelector('#ac-map-pins-group');

    // Floating Tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'ac-map-tooltip-container';
    tooltipContainer.style.position = 'absolute';
    tooltipContainer.style.zIndex = '30';
    tooltipContainer.style.pointerEvents = 'none';
    tooltipContainer.style.transition = 'all 160ms ease-out';
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

        const fillColor = isPrimary ? '#E58E18' : '#D97E1C';

        gPin.innerHTML = `
          <g filter="${isHovered ? 'url(#active-pin-glow)' : 'url(#antique-pin-shadow)'}">
            <ellipse cx="0" cy="1.2" rx="4.8" ry="2.2" fill="rgba(15,8,4,0.38)" />
            <path d="M 0,0 C -6.5,-8 -10,-13 -10,-18 A 10,10 0 1,1 10,-18 C 10,-13 6.5,-8 0,0 Z"
                  fill="${fillColor}" stroke="#3E1C0A" stroke-width="1.6" stroke-linejoin="round" />
            <circle cx="0" cy="-18" r="5.6" fill="#FAF3DE" stroke="#3E1C0A" stroke-width="1.2" />
            ${isPrimary ? `
              <g>
                <line x1="-2.6" y1="-18" x2="2.6" y2="-18" stroke="#4A250E" stroke-width="1.4" stroke-linecap="round" />
                <line x1="0" y1="-20.6" x2="0" y2="-15.4" stroke="#4A250E" stroke-width="1.4" stroke-linecap="round" />
                <circle cx="0" cy="-18" r="1.1" fill="#4A250E" />
              </g>
            ` : `
              <circle cx="0" cy="-18" r="2.2" fill="#4A250E" />
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
      // Strict hover rule: If no location is currently hovered, immediately hide tooltip
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
        <div style="width: 270px; background-color: #FAF4E7; border: 1.5px solid #5B3922; border-radius: 8px; padding: 14px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); position: relative; text-align: left; background-image: radial-gradient(ellipse at top left, #fffdf8, #f5ebd3);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
            <h4 class="font-cartography" style="font-weight: 700; font-size: 15px; color: #381B09; line-height: 1.25; margin: 0; text-transform: uppercase;">
              ${hoveredLocation.name}
            </h4>
            ${isPrimary ? `
              <span style="font-size: 10px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; background-color: #ebd7a7; border: 1px solid #a67c48; color: #5c3810;">
                Origin
              </span>
            ` : ''}
          </div>

          ${hoveredLocation.region ? `
            <p class="font-antique" style="font-size: 11.5px; font-weight: 600; font-style: italic; color: #7B4D2C; margin: 0 0 8px 0;">
              ${hoveredLocation.region}
            </p>
          ` : ''}

          <div style="width: 100%; height: 1px; background: linear-gradient(to right, transparent, rgba(140, 93, 51, 0.5), transparent); margin: 6px 0;"></div>

          <p class="font-antique" style="font-size: 11px; color: #4A3222; line-height: 1.6; margin: 0;">
            ${hoveredLocation.description}
          </p>

          <div style="position: absolute; width: 10px; height: 10px; background-color: #FAF4E7; transform: rotate(45deg); ${notchTop ? '-top: 6px; border-top: 1.5px solid #5B3922; border-left: 1.5px solid #5B3922;' : '-bottom: 6px; border-bottom: 1.5px solid #5B3922; border-right: 1.5px solid #5B3922;'} left: ${notchLeft}; margin-left: -5px;"></div>
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
