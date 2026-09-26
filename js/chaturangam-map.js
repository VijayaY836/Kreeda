(function () {
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 500;

  const CHATURANGAM_LOCATIONS = [
    {
      name: "Chadarangam",
      region: "Andhra Pradesh, India",
      latitude: 16.5062,
      longitude: 80.6480,
      description:
        "The traditional Telugu name for chess, a strategic two-player game where players aim to checkmate the opponent's king.",
      isPrimary: true
    },
    {
      name: "Shatranj",
      region: "North India",
      latitude: 28.6139,
      longitude: 77.2090,
      description:
        "A historic Indian form of chess that evolved from the ancient game of Chaturanga and influenced the development of modern chess.",
      color: "#ea580c"
    },
    {
      name: "Chatrang",
      region: "Iran",
      latitude: 35.6892,
      longitude: 51.3890,
      description:
        "The Persian form of Chaturanga, which later developed into Shatranj and became an important stage in the history of chess.",
      color: "#dc2626"
    },
    {
      name: "Ajedrez",
      region: "Spain",
      latitude: 40.4168,
      longitude: -3.7038,
      description:
        "The Spanish name for chess, a strategic board game where two players compete to checkmate the opposing king.",
      color: "#d97706"
    },
    {
      name: "Shogi",
      region: "Japan",
      latitude: 35.6762,
      longitude: 139.6503,
      description:
        "Japan's traditional chess variant, distinguished by its rule allowing captured pieces to be returned to the board.",
      color: "#c2410c"
    },
    {
      name: "Chess",
      region: "United States",
      latitude: 40.7128,
      longitude: -74.0060,
      description:
        "The modern Western form of chess, where players use strategy and tactics to checkmate the opponent's king.",
      color: "#b45309"
    }
  ];

  window.initChaturangamWorldMap = function (container) {
    if (!container) return;
    container.innerHTML = '';

    // Create wrapper shell matching ZIP structure
    const shell = document.createElement('div');
    shell.className = 'cha-map-shell relative w-full h-full overflow-hidden select-none bg-[#16484b] border-[3px] border-[#381c0d] rounded-xl shadow-2xl cursor-grab active:cursor-grabbing touch-none';
    shell.style.position = 'relative';
    shell.style.width = '100%';
    shell.style.height = '100%';
    shell.style.overflow = 'hidden';
    shell.style.userSelect = 'none';
    shell.style.webkitUserSelect = 'none';
    shell.style.backgroundColor = '#16484b';
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

    const landFeature = topojson.feature(topo, topo.objects.land);
    const bordersMesh = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);
    const coastsMesh = topojson.mesh(topo, topo.objects.countries, (a, b) => a === b);

    const landPathD = pathGenerator(landFeature) || '';
    const borderPathD = pathGenerator(bordersMesh) || '';
    const coastPathD = pathGenerator(coastsMesh) || '';

    const graticule = d3.geoGraticule().step([30, 20])();
    const gratD = pathGenerator(graticule) || '';

    const equatorGeo = {
      type: 'LineString',
      coordinates: [[-180, 0], [180, 0]]
    };
    const eqD = pathGenerator(equatorGeo) || '';

    const projectedLocations = CHATURANGAM_LOCATIONS.map(loc => {
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

    svgNode.innerHTML = `
      <defs>
        <radialGradient id="chadarangam-pin-grad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="40%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#b45309" />
        </radialGradient>

        <filter id="antique-pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="1.8" flood-color="#1a0c06" flood-opacity="0.5" />
        </filter>
      </defs>

      <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#16484b" />

      <g id="cha-map-zoom-group">
        <path d="${gratD}" fill="none" stroke="#bad7d2" stroke-width="0.65" stroke-opacity="0.18" />
        <path d="${eqD}" fill="none" stroke="#c8e4df" stroke-width="1.2" stroke-opacity="0.38" />
        <path d="${landPathD}" fill="#ebdcc4" stroke="#5c3b1e" stroke-width="0.3" />
        <path d="${borderPathD}" fill="none" stroke="#7a5332" stroke-width="0.75" stroke-opacity="0.85" stroke-linecap="round" stroke-linejoin="round" />
        <path d="${coastPathD}" fill="none" stroke="#5c381c" stroke-width="0.9" stroke-opacity="0.95" stroke-linecap="round" stroke-linejoin="round" />
        <g id="cha-map-pins-group"></g>
      </g>

      <rect x="3" y="3" width="${MAP_WIDTH - 6}" height="${MAP_HEIGHT - 6}" rx="12" fill="none" stroke="#4a2815" stroke-width="1.2" stroke-opacity="0.45" pointer-events="none" />
    `;

    shell.appendChild(svgNode);

    const zoomGroup = svgNode.querySelector('#cha-map-zoom-group');
    const pinsGroup = svgNode.querySelector('#cha-map-pins-group');

    // Floating Tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'cha-map-tooltip-container';
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

        const pinScale = (isHovered ? 1.18 : 1) / Math.pow(zoom, 0.7);

        const gPin = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gPin.setAttribute('transform', `translate(${loc.x}, ${loc.y}) scale(${pinScale})`);
        gPin.style.cursor = 'pointer';
        gPin.style.transition = 'transform 150ms ease-out';
        gPin.setAttribute('role', 'button');
        gPin.setAttribute('tabindex', '0');
        gPin.setAttribute('aria-label', `${loc.name}, ${loc.region || ''}`);

        const fillColor = isPrimary ? 'url(#chadarangam-pin-grad)' : (loc.color || '#b45309');

        gPin.innerHTML = `
          <ellipse cx="0" cy="1" rx="4.5" ry="1.8" fill="#130804" opacity="0.4" />
          ${isPrimary ? `
            <circle cx="0" cy="-16" r="13" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.6" class="animate-ping" style="transform-origin: 0px -16px; animation-duration: 3.2s;" />
          ` : ''}
          <g filter="url(#antique-pin-shadow)">
            <path d="M 0 0 C -3 -3, -9.5 -9.5, -9.5 -15.5 C -9.5 -21, -5.2 -25.5, 0 -25.5 C 5.2 -25.5, 9.5 -21, 9.5 -15.5 C 9.5 -9.5, 3 -3, 0 0 Z"
                  fill="${fillColor}" stroke="#381c0d" stroke-width="1.6" stroke-linejoin="round" />
            ${isPrimary ? `
              <g transform="translate(0, -15.5)">
                <circle cx="0" cy="0" r="4.2" fill="#fffbeb" stroke="#381c0d" stroke-width="1" />
                <path d="M -2.2 1.3 L -2.2 -1 L -1 -0.2 L 0 -1.8 L 1 -0.2 L 2.2 -1 L 2.2 1.3 Z" fill="#381c0d" />
              </g>
            ` : `
              <circle cx="0" cy="-15.5" r="3.2" fill="#fffdf7" stroke="#381c0d" stroke-width="1.1" />
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
        <div style="width: 270px; background-color: #fdfbf7; border: 1.5px solid #5a3821; border-radius: 8px; padding: 14px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); position: relative; text-align: left; background-image: radial-gradient(ellipse at 50% 0%, #fffdf8 0%, #f6eee0 100%);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
            <h4 class="font-cinzel" style="font-weight: 700; font-size: 14px; color: #381c0b; line-height: 1.25; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
              ${hoveredLocation.name}
            </h4>
            ${isPrimary ? `
              <span style="font-size: 10px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; background-color: #fef08a; border: 1px solid #d97706; color: #78350f;">
                Origin
              </span>
            ` : ''}
          </div>

          ${hoveredLocation.region ? `
            <p style="font-size: 11px; font-weight: 600; color: #8c5324; margin: 2px 0 8px 0;">
              ${hoveredLocation.region}
            </p>
          ` : ''}

          <div style="width: 100%; height: 1px; background-color: #d9c4a4; opacity: 0.85; margin: 6px 0;"></div>

          <p style="font-size: 11.5px; color: #3d291a; line-height: 1.6; margin: 0;">
            ${hoveredLocation.description}
          </p>

          <div style="position: absolute; width: 10px; height: 10px; background-color: #f6eee0; transform: rotate(45deg); ${notchTop ? '-top: 6px; border-top: 1.5px solid #5a3821; border-left: 1.5px solid #5a3821;' : '-bottom: 6px; border-bottom: 1.5px solid #5a3821; border-right: 1.5px solid #5a3821;'} left: ${notchLeft}; margin-left: -5px;"></div>
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
