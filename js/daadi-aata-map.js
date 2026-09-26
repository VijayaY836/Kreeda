(function () {
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 500;

  const DAADI_AATA_LOCATIONS = [
    {
      name: "Daadi Aata",
      region: "Andhra Pradesh & Telangana, India",
      latitude: 17.3850,
      longitude: 78.4867,
      description:
        "A traditional strategy game played by placing and moving pieces to form lines, allowing players to capture their opponent's pieces.",
      isPrimary: true
    },
    {
      name: "Kattam Aata",
      region: "Tamil Nadu, India",
      latitude: 13.0827,
      longitude: 80.2707,
      description:
        "A traditional Tamil board game based on forming lines of pieces while strategically blocking and capturing the opponent.",
      color: "#d97706",
      innerColor: "#fef3c7"
    },
    {
      name: "Navkankari",
      region: "Hindi & North India",
      latitude: 28.6139,
      longitude: 77.2090,
      description:
        "A traditional Indian strategy game where players place and move pieces to form rows of three and capture their opponent's pieces.",
      color: "#ea580c",
      innerColor: "#ffedd5"
    },
    {
      name: "Morabaraba",
      region: "South Africa",
      latitude: -26.2041,
      longitude: 28.0473,
      description:
        "A popular Southern African strategy game in which players place and move pieces to create lines and capture opposing pieces.",
      color: "#b91c1c",
      innerColor: "#fee2e2"
    },
    {
      name: "The Mill Game",
      region: "United Kingdom",
      latitude: 51.5074,
      longitude: -0.1278,
      description:
        "A traditional British name for the line-forming strategy game where players aim to create mills and remove their opponent's pieces.",
      color: "#2563eb",
      innerColor: "#dbeafe"
    },
    {
      name: "Nine Men's Morris",
      region: "United States",
      latitude: 40.7128,
      longitude: -74.0060,
      description:
        "A classic strategy game where players place and move nine pieces each, forming rows of three to capture their opponent's pieces.",
      color: "#991b1b",
      innerColor: "#fee2e2"
    }
  ];

  window.initDaadiAataWorldMap = function (container) {
    if (!container) return;
    container.innerHTML = '';

    // Create wrapper shell matching ZIP structure
    const shell = document.createElement('div');
    shell.className = 'da-map-shell relative w-full h-full overflow-hidden select-none bg-[#154e51] border-[3px] border-[#361b0c] rounded-xl shadow-2xl cursor-grab active:cursor-grabbing touch-none';
    shell.style.position = 'relative';
    shell.style.width = '100%';
    shell.style.height = '100%';
    shell.style.overflow = 'hidden';
    shell.style.userSelect = 'none';
    shell.style.webkitUserSelect = 'none';
    shell.style.backgroundColor = '#154e51';
    shell.style.border = '3px solid #361b0c';
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

    const landPathD = pathGenerator(landFeature) || '';
    const borderPathD = pathGenerator(bordersMesh) || '';

    const graticule = d3.geoGraticule().step([30, 30])();
    const gratD = pathGenerator(graticule) || '';

    const equatorGeo = {
      type: 'LineString',
      coordinates: Array.from({ length: 73 }, (_, i) => [-180 + i * 5, 0])
    };
    const eqD = pathGenerator(equatorGeo) || '';

    const projectedLocations = DAADI_AATA_LOCATIONS.map(loc => {
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
        <radialGradient id="daadi-pin-gradient" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="45%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#b45309" />
        </radialGradient>

        <filter id="parchment-glow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#0d3537" flood-opacity="0.45" />
        </filter>

        <filter id="pin-shadow" x="-50%" y="-30%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000000" flood-opacity="0.45" />
        </filter>
      </defs>

      <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#154e51" />

      <g id="da-map-zoom-group">
        <path d="${gratD}" fill="none" stroke="#765f49" stroke-width="0.7" stroke-dasharray="2.5,3.5" stroke-opacity="0.45" />
        <path d="${eqD}" fill="none" stroke="#e7d4b0" stroke-width="1.5" stroke-opacity="0.65" />
        <path d="${landPathD}" fill="#eeddb9" filter="url(#parchment-glow)" />
        <path d="${borderPathD}" fill="none" stroke="#8d7457" stroke-width="0.75" stroke-linejoin="round" stroke-linecap="round" />
        <g id="da-map-pins-group"></g>
      </g>
    `;

    shell.appendChild(svgNode);

    const zoomGroup = svgNode.querySelector('#da-map-zoom-group');
    const pinsGroup = svgNode.querySelector('#da-map-pins-group');

    // Floating Tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'da-map-tooltip-container';
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

        const fillColor = isPrimary ? 'url(#daadi-pin-gradient)' : (loc.color || '#b45309');
        const innerColor = isPrimary ? '#fef08a' : (loc.innerColor || '#fef3c7');

        gPin.innerHTML = `
          ${isPrimary ? `
            <circle cx="0" cy="-20" r="15" fill="#fbbf24" opacity="0.3" class="animate-pulse" />
          ` : ''}
          <g filter="url(#pin-shadow)">
            ${isPrimary ? `
              <path d="M 0,0 C -2.8,-6 -11.5,-13.5 -11.5,-21 A 11.5,11.5 0 1,1 11.5,-21 C 11.5,-13.5 2.8,-6 0,0 Z"
                    fill="${fillColor}" stroke="#2c150b" stroke-width="2" />
              <circle cx="0" cy="-21" r="5.5" fill="${innerColor}" stroke="#2c150b" stroke-width="1.3" />
              <circle cx="0" cy="-21" r="2.2" fill="#78350f" />
            ` : `
              <path d="M 0,0 C -2.5,-5 -10,-12 -10,-19 A 10,10 0 1,1 10,-19 C 10,-12 2.5,-5 0,0 Z"
                    fill="${fillColor}" stroke="#2c150b" stroke-width="1.8" />
              <circle cx="0" cy="-19" r="4" fill="${innerColor}" stroke="#2c150b" stroke-width="1.2" />
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
        <div style="width: 270px; background-color: #faf4e6; border: 1.5px solid #4a2b16; border-radius: 8px; padding: 14px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); position: relative; text-align: left; background-image: radial-gradient(ellipse at top left, #fffdf8, #f5ebd3);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
            <h4 class="font-cartography" style="font-weight: 700; font-size: 15px; color: #2d160a; line-height: 1.25; margin: 0; text-transform: uppercase;">
              ${hoveredLocation.name}
            </h4>
            ${isPrimary ? `
              <span style="font-size: 10px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; background-color: #ebd7a7; border: 1px solid #a67c48; color: #5c3810;">
                Origin
              </span>
            ` : ''}
          </div>

          ${hoveredLocation.region ? `
            <p class="font-antique" style="font-size: 11.5px; font-weight: 500; font-style: italic; color: #7a4e2c; margin: 0 0 8px 0;">
              ${hoveredLocation.region}
            </p>
          ` : ''}

          <div style="width: 100%; height: 1px; background: linear-gradient(to right, transparent, rgba(140, 93, 51, 0.5), transparent); margin: 6px 0;"></div>

          <p class="font-antique" style="font-size: 11px; color: #3d2719; line-height: 1.6; margin: 0;">
            ${hoveredLocation.description}
          </p>

          <div style="position: absolute; width: 10px; height: 10px; background-color: #f5ebd3; transform: rotate(45deg); ${notchTop ? '-top: 6px; border-top: 1.5px solid #4a2b16; border-left: 1.5px solid #4a2b16;' : '-bottom: 6px; border-bottom: 1.5px solid #4a2b16; border-right: 1.5px solid #4a2b16;'} left: ${notchLeft}; margin-left: -5px;"></div>
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
