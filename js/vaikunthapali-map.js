(function () {
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 500;

  const VAIKUNTHAPALI_LOCATIONS = [
    {
      name: "Vaikunthapali",
      region: "Andhra Pradesh, India",
      latitude: 16.5062,
      longitude: 80.6480,
      description:
        "A traditional Telugu board game where players climb ladders and slide down snakes, symbolizing the ups and downs of life's journey.",
      category: "origin",
      color: "#e67e22"
    },
    {
      name: "Paramapadam",
      region: "Tamil Nadu, India",
      latitude: 13.0827,
      longitude: 80.2707,
      description:
        "A traditional Tamil board game where ladders represent progress and snakes represent setbacks on the journey toward the final destination.",
      category: "tradition",
      color: "#d35400"
    },
    {
      name: "Shap Shiri",
      region: "West Bengal, India",
      latitude: 22.5726,
      longitude: 88.3639,
      description:
        "A Bengali version of the classic game where players race across the board, climbing ladders and sliding down snakes.",
      category: "tradition",
      color: "#e67e22"
    },
    {
      name: "Snakes and Ladders",
      region: "United Kingdom",
      latitude: 51.5074,
      longitude: -0.1278,
      description:
        "The classic British board game where players roll dice, climb ladders, and slide down snakes as they race to the finish.",
      category: "adaptation",
      color: "#2980b9"
    },
    {
      name: "Shapludu",
      region: "Bangladesh",
      latitude: 23.8103,
      longitude: 90.4125,
      description:
        "A traditional Bangladeshi board game of luck and movement, where players advance through the board while facing unexpected setbacks.",
      category: "tradition",
      color: "#c0392b"
    },
    {
      name: "Nagapasa",
      region: "Nepal",
      latitude: 27.7172,
      longitude: 85.3240,
      description:
        "A traditional Nepali game featuring snakes and ladders, where players navigate a path of progress and setbacks to reach the finish.",
      category: "tradition",
      color: "#d35400"
    }
  ];

  window.initVaikunthapaliWorldMap = function (container) {
    if (!container) return;
    container.innerHTML = '';

    // Create wrapper shell matching ZIP structure and styling
    const shell = document.createElement('div');
    shell.className = 'vp-map-shell relative w-full h-full overflow-hidden select-none bg-[#1d5b62] border-[3px] border-[#3e1b0c] rounded-xl shadow-2xl cursor-grab active:cursor-grabbing touch-none';
    shell.style.position = 'relative';
    shell.style.width = '100%';
    shell.style.height = '100%';
    shell.style.overflow = 'hidden';
    shell.style.userSelect = 'none';
    shell.style.webkitUserSelect = 'none';
    shell.style.backgroundColor = '#1d5b62';
    shell.style.border = '3px solid #3e1b0c';
    shell.style.borderRadius = '12px';
    shell.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
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

    // D3 Projection: Scale factor 1.30x and shifted Y translate to crop Antarctica and fill populated land
    const projection = d3.geoEquirectangular()
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2 + 45])
      .scale((MAP_WIDTH / (2 * Math.PI)) * 1.30);

    const pathGenerator = d3.geoPath().projection(projection);

    const topo = window.WORLD_ATLAS_DATA;
    if (!topo) {
      console.error('World Atlas data missing!');
      return;
    }

    const countries = topojson.feature(topo, topo.objects.countries);
    const borders = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);
    const graticule = d3.geoGraticule().step([30, 20])();
    const equator = {
      type: "LineString",
      coordinates: [
        [-180, 0],
        [-90, 0],
        [0, 0],
        [90, 0],
        [180, 0]
      ]
    };

    const landFeature = pathGenerator(countries) || '';
    const countryBoundaries = pathGenerator(borders) || '';
    const graticulePaths = pathGenerator(graticule) || '';
    const equatorPath = pathGenerator(equator) || '';

    const projectedLocations = VAIKUNTHAPALI_LOCATIONS.map(loc => {
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
        <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e5f66" />
          <stop offset="50%" stop-color="#1a585f" />
          <stop offset="100%" stop-color="#164e55" />
        </linearGradient>

        <linearGradient id="parchmentLand" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#faecd0" />
          <stop offset="60%" stop-color="#f3dfb7" />
          <stop offset="100%" stop-color="#ecd4a4" />
        </linearGradient>

        <filter id="pinShadow" x="-50%" y="-40%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#1a0c06" flood-opacity="0.5" />
        </filter>

        <filter id="originGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#f59e0b" flood-opacity="0.8" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#1a0c06" flood-opacity="0.5" />
        </filter>
      </defs>

      <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="url(#oceanGrad)" />

      <g id="vp-map-zoom-group">
        <path d="${graticulePaths}" fill="none" stroke="#aad7d9" stroke-width="0.6" stroke-dasharray="2,3" stroke-opacity="0.32" />
        <path d="${equatorPath}" fill="none" stroke="#c8e9ea" stroke-width="1.2" stroke-opacity="0.55" />
        <path d="${equatorPath}" fill="none" stroke="#3e1b0c" stroke-width="0.5" stroke-dasharray="4,4" stroke-opacity="0.4" />
        <path d="${landFeature}" fill="url(#parchmentLand)" stroke="#94744d" stroke-width="0.9" stroke-linejoin="round" />
        <path d="${countryBoundaries}" fill="none" stroke="#a88b64" stroke-width="0.45" stroke-opacity="0.85" stroke-dasharray="1,0.5" />
        <g id="vp-map-pins-group"></g>
      </g>

      <rect x="3" y="3" width="${MAP_WIDTH - 6}" height="${MAP_HEIGHT - 6}" fill="none" stroke="#eedcb5" stroke-width="1.5" stroke-opacity="0.4" rx="8" pointer-events="none" />
      <rect x="7" y="7" width="${MAP_WIDTH - 14}" height="${MAP_HEIGHT - 14}" fill="none" stroke="#eedcb5" stroke-width="0.6" stroke-dasharray="3,3" stroke-opacity="0.25" rx="6" pointer-events="none" />
    `;

    shell.appendChild(svgNode);

    const zoomGroup = svgNode.querySelector('#vp-map-zoom-group');
    const pinsGroup = svgNode.querySelector('#vp-map-pins-group');

    // Floating Tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'vp-map-tooltip-container';
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
        const isVaikunthapali = loc.name.toLowerCase() === 'vaikunthapali';
        const isHovered = hoveredLocation?.name === loc.name;

        const baseColor = loc.color || (isVaikunthapali ? '#e67e22' : '#d35400');
        const pinScale = (isHovered ? 1.25 : 1) / Math.sqrt(zoom);

        const gPin = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gPin.setAttribute('data-loc-name', loc.name);
        gPin.setAttribute('transform', `translate(${loc.x}, ${loc.y}) scale(${pinScale})`);
        gPin.style.cursor = 'pointer';
        gPin.style.transition = 'transform 150ms ease-out';
        gPin.setAttribute('role', 'button');
        gPin.setAttribute('tabindex', '0');
        gPin.setAttribute('aria-label', `${loc.name}, ${loc.region || ''}`);

        gPin.innerHTML = `
          <circle cx="0" cy="-14" r="18" fill="transparent" />
          <g filter="${isVaikunthapali ? 'url(#originGlow)' : 'url(#pinShadow)'}">
            <path d="M 0 0 C -2.5 -3.5, -9 -12, -9 -17.5 A 9 9 0 1 1 9 -17.5 C 9 -12, 2.5 -3.5, 0 0 Z"
                  fill="${baseColor}" stroke="#381708" stroke-width="1.4" stroke-linejoin="round" />
            <circle cx="0" cy="-17.5" r="${isVaikunthapali ? '4' : '3.4'}" fill="#fff8ea" stroke="#381708" stroke-width="1.1" />
            ${isVaikunthapali ? '<circle cx="0" cy="-17.5" r="1.8" fill="#b45309" />' : ''}
          </g>
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
        const pinScale = (isHovered ? 1.25 : 1) / Math.sqrt(zoom);
        gPin.setAttribute('transform', `translate(${loc.x}, ${loc.y}) scale(${pinScale})`);
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

      const isVaikunthapali = hoveredLocation.name.toLowerCase() === 'vaikunthapali';

      tooltipContainer.style.left = '0px';
      tooltipContainer.style.top = '0px';
      tooltipContainer.style.transform = 'none';

      tooltipContainer.innerHTML = `
        <div style="width: 270px; background-color: #fbf5e8; border: 1.5px solid #4a2414; border-radius: 8px; padding: 14px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); position: relative; text-align: left; background-image: radial-gradient(ellipse at top left, #fffdf8, #f5ebd3); pointer-events: none;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
            <h4 class="font-cartography" style="font-weight: 700; font-size: 16px; color: #2e1408; line-height: 1.25; margin: 0;">
              ${hoveredLocation.name}
            </h4>
            ${isVaikunthapali ? `
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

          <div class="vp-tooltip-notch" style="position: absolute; width: 10px; height: 10px; background-color: #f5ebd3; transform: rotate(45deg); pointer-events: none;"></div>
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

      const notchEl = tooltipContainer.querySelector('.vp-tooltip-notch');
      if (notchEl) {
        const notchLeftPx = Math.max(16, Math.min(cardWidth - 16, pinX - left));
        const notchStyle = isBelow
          ? '-top: 6px; border-top: 1.5px solid #4a2414; border-left: 1.5px solid #4a2414;'
          : '-bottom: 6px; border-bottom: 1.5px solid #4a2414; border-right: 1.5px solid #4a2414;';
        notchEl.style.cssText = `position: absolute; width: 10px; height: 10px; background-color: #f5ebd3; transform: rotate(45deg); ${notchStyle} left: ${notchLeftPx}px; margin-left: -5px; pointer-events: none;`;
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
