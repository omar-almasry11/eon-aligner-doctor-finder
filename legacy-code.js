/* ===============================
   Google Map + Filters + List (Slater)
   Arabic-aware sorting + addresses (via Maps language).
   =============================== */

(() => {
  const SELECTORS = {
    mapEl: "#google-map",
    doctorItem: ".doctor-item",
    countrySel: "#country-select",
    citySel: "#city-select",
    loadingOverlay: "#loading-overlay",
    listOverlay: "#list-overlay",
    listEmptyMsg: "[data-list-empty]",
  };

  const LIST = {
    wrapper: "#list-wrapper",
    template: '[data-list-template="true"]',
  };

  let INIT_DONE = false;

  // ----- Arabic detection & strings -----
  const IS_AR = /^ar\b/i.test(document.documentElement.lang || "") || document.documentElement
    .dir === "rtl";
  const TEXT = {
    loadingAddr: IS_AR ? "جاري تحميل العنوان…" : "Loading address…",
    addrNotFound: IS_AR ? "لم يتم العثور على العنوان" : "Address not found",
  };

  // Use Arabic-first collator, fall back to English
  const collator = new Intl.Collator(IS_AR ? ["ar", "en"] : ["en", "ar"], {
    sensitivity: "base",
    numeric: true,
    ignorePunctuation: true,
  });

  // Remove “Dr.” / “Doctor” / Arabic “د.” / “دكتور” from the start before sorting
  const stripDoctorPrefix = (s = "") =>
    s.trim().replace(/^\s*(?:dr\.?|doctor|د\.?|دكتور)\s*/i, "");

  // Creates a sort key from the *display name* (Arabic preferred)
  const toSortKey = (name = "") => stripDoctorPrefix(name).toLocaleLowerCase();

  // ---------- Overlay fade helpers ----------
  const FADE_MS = 500;

  function fadeShow(selector, display = "flex") {
    const el = document.querySelector(selector);
    if (!el) return;
    if (el._fadeTimer) clearTimeout(el._fadeTimer);
    el.style.transition = `opacity ${FADE_MS}ms ease`;
    el.style.display = display;
    // force reflow so transition applies
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.style.opacity = "1";
  }

  function fadeHide(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (el._fadeTimer) clearTimeout(el._fadeTimer);
    el.style.transition = `opacity ${FADE_MS}ms ease`;
    el.style.opacity = "0";
    el._fadeTimer = setTimeout(() => {
      el.style.display = "none";
      el._fadeTimer = null;
    }, FADE_MS);
  }

  // --- gating helpers (unchanged, robust) ---
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const afterWindowLoad = () =>
    document.readyState === "complete" ?
    Promise.resolve() :
    new Promise((res) => window.addEventListener("load", res, { once: true }));

  const waitForFs = async (event, timeout = 2500) => {
    if (!window.fsAttributes || typeof window.fsAttributes.once !== "function") return;
    await new Promise((resolve) => {
      const to = setTimeout(resolve, timeout);
      try {
        window.fsAttributes.once(event, () => {
          clearTimeout(to);
          resolve();
        });
      } catch {
        resolve();
      }
    });
  };

  const waitForStableDoctors = async ({
    min = 1,
    stableCycles = 4,
    interval = 200,
    maxWait = 8000,
  } = {}) => {
    let last = -1,
      stable = 0,
      waited = 0;
    return new Promise((resolve) => {
      const iv = setInterval(() => {
        const n = document.querySelectorAll(SELECTORS.doctorItem).length;
        if (n === last) stable += 1;
        else stable = 0;
        last = n;
        waited += interval;
        if ((n >= min && stable >= stableCycles) || waited >= maxWait) {
          clearInterval(iv);
          resolve(n);
        }
      }, interval);
    });
  };

  const waitForCMSStableDeep = async ({
    quietMs = 900,
    checkEvery = 200,
    maxWait = 15000,
    min = 1,
  } = {}) => {
    const now = () => Date.now();
    let lastSig = "";
    let lastChange = now();

    const computeSig = () => {
      const els = Array.from(document.querySelectorAll(SELECTORS.doctorItem));
      const parts = els.map(
        (el) =>
        `${el.dataset.name || ""}|${el.dataset.nameAr || el.dataset.arabicName || ""}|${
            el.dataset.country || ""
          }|${el.dataset.city || ""}`
      );
      return `${els.length}::${parts.join("||")}`;
    };

    const changed = () => {
      const sig = computeSig();
      if (sig !== lastSig) {
        lastSig = sig;
        lastChange = now();
      }
    };

    return new Promise((resolve) => {
      const obs = new MutationObserver(changed);
      obs.observe(document.body, { childList: true, subtree: true });

      const tick = setInterval(() => {
        changed();
        const count = document.querySelectorAll(SELECTORS.doctorItem).length;
        const quietEnough = now() - lastChange >= quietMs;
        if ((count >= min && quietEnough) || now() - (lastChange - quietMs) >=
          maxWait) {
          cleanup();
          resolve(true);
        }
      }, checkEvery);

      const to = setTimeout(() => {
        cleanup();
        resolve(true);
      }, maxWait);

      function cleanup() {
        obs.disconnect();
        clearInterval(tick);
        clearTimeout(to);
      }
      changed();
    });
  };

  // keep the dropdown closer
  document.querySelector(".map-item-2.active")?.addEventListener("click", () => {
    document.querySelector(".new-dropdown-inner")?.style.setProperty("height", "0px");
  });

  const defineAndRun = () => {
    if (INIT_DONE) return;
    if (!(window.google && window.google.maps)) {
      setTimeout(defineAndRun, 50);
      return;
    }
    gateAndStart();
  };

  if (window.__gmapsReady) defineAndRun();
  else window.addEventListener("gmaps:ready", defineAndRun, { once: true });

  async function gateAndStart() {
    // Show MAP overlay while booting
    fadeShow(SELECTORS.loadingOverlay);
    const overlayFailSafe = setTimeout(() => fadeHide(SELECTORS.loadingOverlay), 15000);

    try {
      await afterWindowLoad();
      await Promise.race([waitForFs("cmsfilter"), delay(1200)]);
      await Promise.race([waitForFs("cmsload"), delay(1200)]);
      await waitForStableDoctors();
      await waitForCMSStableDeep();
      await startMapLogic();
    } finally {
      fadeHide(SELECTORS.loadingOverlay);
      clearTimeout(overlayFailSafe);
    }
  }

  // ----------------- MAIN -----------------
  async function startMapLogic() {
    if (INIT_DONE) return;
    INIT_DONE = true;

    const waitFor = (testFn, { tries = 40, interval = 150 } = {}) =>
      new Promise((resolve) => {
        let n = 0;
        const t = setInterval(() => {
          if (testFn()) {
            clearInterval(t);
            resolve(true);
          } else if (++n >= tries) {
            clearInterval(t);
            resolve(false);
          }
        }, interval);
      });

    if (!(await waitFor(() => document.querySelector(SELECTORS.mapEl)))) {
      console.error("❌ Map container not found:", SELECTORS.mapEl);
      return;
    }

    // ---- Map (lean) ----
    const mapEl = document.querySelector(SELECTORS.mapEl);
    const map = new google.maps.Map(mapEl, {
      center: { lat: 25.276987, lng: 55.296249 },
      zoom: 6,
      minZoom: 2,
      maxZoom: 18,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      gestureHandling: "cooperative",
    });

    const geocoder = new google.maps.Geocoder();
    const tooltipInfoWindow = new google.maps.InfoWindow();
    const popupInfoWindow = new google.maps.InfoWindow();
    let allMarkers = [];

    // Geocode cache
    const geocodeCache = new Map();
    const geocodeOnce = (lat, lng) => {
      const key = `${lat},${lng}`;
      if (geocodeCache.has(key)) return geocodeCache.get(key);
      const p = new Promise((resolve) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          resolve(status === "OK" && results?.[0] ? results[0].formatted_address :
            null);
        });
      });
      geocodeCache.set(key, p);
      return p;
    };

    // Read CMS once + helpers
    const countrySelect = document.querySelector(SELECTORS.countrySel);
    const citySelect = document.querySelector(SELECTORS.citySel);

    const countryCityMap = {};
    const doctorData = [];

    function upsertCountryCity(country, city) {
      countryCityMap[country] ||= new Set();
      countryCityMap[country].add(city);
    }

    function readDoctorFromEl(el) {
      // Arabic name variants first; then English
      const nameAr =
        el.dataset.nameAr ||
        el.dataset.arabicName ||
        el.dataset.nameArabic ||
        el.dataset.name_ar ||
        "";
      const nameEn = el.dataset.name || "";
      const displayName = nameAr || nameEn; // prefer Arabic on the Arabic page

      const lat = parseFloat(el.dataset.lat);
      const lng = parseFloat(el.dataset.lng);
      const city = (el.dataset.city || "").trim();
      const country = (el.dataset.country || "").trim();
      if (Number.isNaN(lat) || Number.isNaN(lng) || !city || !country) return null;

      const profileSlug = el.dataset.profile || "";
      const clinic = el.dataset.clinic || "";
      const popupContent = el.querySelector(".map-popup-content");

      const sourcePhotoEl =
        el.querySelector(".map-popup_doctor-info-wrapper img") || el.querySelector("img");
      const photoSrc = sourcePhotoEl ? sourcePhotoEl.currentSrc || sourcePhotoEl.src || "" : "";

      return {
        el,
        // store both, but use one consistently everywhere
        name: displayName,
        nameAr,
        nameEn,
        sortKey: toSortKey(displayName),
        lat,
        lng,
        city,
        country,
        clinic,
        profileSlug,
        photoSrc,
        photoEl: sourcePhotoEl || null,
        popupContent,
        listEl: null,
        marker: null,
      };
    }

    // Initial harvest
    Array.from(document.querySelectorAll(SELECTORS.doctorItem)).forEach((el) => {
      const d = readDoctorFromEl(el);
      if (!d) return;
      upsertCountryCity(d.country, d.city);
      doctorData.push(d);
    });

    // Create markers once
    createMarkersOnce(doctorData);

    function rebuildCountryOptions() {
      if (!countrySelect) return;
      const current = countrySelect.value;
      countrySelect.innerHTML = `<option value="">Select Your Country</option>`;
      Object.keys(countryCityMap)
        .sort((a, b) => collator.compare(a, b))
        .forEach((c) => {
          const o = document.createElement("option");
          o.value = c;
          o.textContent = c;
          countrySelect.appendChild(o);
        });
      if (current && countryCityMap[current]) countrySelect.value = current;
    }

    rebuildCountryOptions();

    // List overlay/message start state: no country selected yet
    showListEmptyMessage(true);
    fadeShow(SELECTORS.listOverlay);

    // Filter + build list lazily
    countrySelect?.addEventListener("change", () => {
      const c = countrySelect.value;
      if (citySelect) {
        citySelect.innerHTML = `<option value="">Select Your City</option>`;
        citySelect.style.display = c ? "inline-block" : "none";
        if (c) {
          Array.from(countryCityMap[c] || [])
            .toSorted((a, b) => collator.compare(a, b))
            .forEach((city) => {
              const o = document.createElement("option");
              o.value = city;
              o.textContent = city;
              citySelect.appendChild(o);
            });
        }
      }
      filterAndRender();
    });
    citySelect?.addEventListener("change", filterAndRender);

    // Initial: markers only
    filterAndRender();

    // Late hydration window (~8s)
    beginLateHydrationWindow(8000);

    function beginLateHydrationWindow(ms = 8000) {
      const seen = new WeakSet(Array.from(document.querySelectorAll(SELECTORS.doctorItem)));
      const obs = new MutationObserver((muts) => {
        let changed = false;
        muts.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            const candidates = node.matches?.(SELECTORS.doctorItem) ? [node] :
              Array.from(node.querySelectorAll?.(SELECTORS.doctorItem) || []);
            candidates.forEach((el) => {
              if (seen.has(el)) return;
              seen.add(el);
              const d = readDoctorFromEl(el);
              if (!d) return;
              doctorData.push(d);
              upsertCountryCity(d.country, d.city);
              createMarkersOnce([d]);
              changed = true;
            });
          });
        });
        if (changed) {
          rebuildCountryOptions();
          filterAndRender();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => obs.disconnect(), ms);
    }

    function filterAndRender() {
      const selCountry = countrySelect?.value || "";
      const selCity = citySelect?.value || "";

      const visible = doctorData.filter(
        (d) => (!selCountry || d.country === selCountry) && (!selCity || d.city === selCity)
      );

      // Toggle source CMS cards
      doctorData.forEach((d) => {
        const show = visible.includes(d) || !selCountry;
        if (d.el) d.el.style.display = show ? "block" : "none";
      });

      // Toggle markers
      doctorData.forEach((d) => {
        const show = visible.includes(d) || !selCountry;
        if (d.marker) d.marker.setMap(show ? map : null);
      });

      // LIST: build only after a country is chosen + control list overlay with fade
      if (!selCountry) {
        clearList();
        showListEmptyMessage(true);
        fadeShow(SELECTORS.listOverlay);
      } else {
        showListEmptyMessage(false);
        fadeHide(SELECTORS.listOverlay);
        buildDoctorList(visible);
      }

      // modest recenter
      if (visible.length) {
        if (selCity && selCountry) {
          geocoder.geocode({ address: `${selCity}, ${selCountry}` }, (r, st) => {
            if (st === "OK" && r?.[0]) {
              map.setCenter(r[0].geometry.location);
              map.setZoom(12);
            }
          });
        } else if (selCountry) {
          geocoder.geocode({ address: selCountry }, (r, st) => {
            if (st === "OK" && r?.[0]) {
              map.setCenter(r[0].geometry.location);
              map.setZoom(6);
            }
          });
        }
      }
    }

    // ---------- helpers ----------
    function showListEmptyMessage(show) {
      const msg = document.querySelector(SELECTORS.listEmptyMsg);
      if (msg) msg.style.display = show ? "" : "none";
    }

    function clearList() {
      const wrap = document.querySelector(LIST.wrapper);
      if (wrap) wrap.innerHTML = "";
    }

    function applyPhotoToRow(row, d) {
      const targetImg = row.querySelector("[data-photo]") || row.querySelector("img");
      if (!targetImg) return;
      const altName = d.name || d.nameAr || d.nameEn || targetImg.alt || "";
      if (d.photoEl && d.photoEl.tagName === "IMG") {
        const src = d.photoEl.currentSrc || d.photoEl.src;
        if (src) {
          targetImg.src = src;
          if (d.photoEl.srcset) targetImg.setAttribute("srcset", d.photoEl.srcset);
          else targetImg.removeAttribute("srcset");
          if (d.photoEl.sizes) targetImg.setAttribute("sizes", d.photoEl.sizes);
          else targetImg.removeAttribute("sizes");
          targetImg.alt = altName;
          targetImg.loading = targetImg.loading || "lazy";
        }
      } else if (d.photoSrc) {
        targetImg.src = d.photoSrc;
        targetImg.removeAttribute("srcset");
        targetImg.removeAttribute("sizes");
        targetImg.alt = altName;
        targetImg.loading = targetImg.loading || "lazy";
      }
    }

    function stripPopupBits(root) {
      root.querySelectorAll('.map-popup-close-button, [data-popup-only]').forEach((n) => n
        .remove());
    }

    function buildDoctorList(list) {
      const wrap = document.querySelector(LIST.wrapper);
      const template = document.querySelector(LIST.template);
      if (!wrap || !template) {
        console.warn("⚠️ Missing list wrapper or template.", {
          wrap: !!wrap,
          template: !!
            template
        });
        return;
      }

      template.style.display = "none";
      wrap.innerHTML = "";

      const sorted = [...list].sort((a, b) => collator.compare(a.sortKey, b.sortKey));
      const frag = document.createDocumentFragment();

      sorted.forEach((d, i) => {
        const row = template.cloneNode(true);
        row.style.display = "";
        row.removeAttribute("data-list-template");
        row.dataset.docIndex = String(i);

        stripPopupBits(row);

        const nameEl = row.querySelector("[data-name]") || row.querySelector(
          ".doctor-name");
        if (nameEl) nameEl.textContent = d.name;

        const clinicEl = row.querySelector("[data-clinic]") || row.querySelector(
          ".doctor-clinic");
        if (clinicEl) clinicEl.textContent = d.clinic;

        applyPhotoToRow(row, d);

        const profileA =
          row.querySelector("[data-profile-link]") ||
          Array.from(row.querySelectorAll("a")).find((a) => /visit profile/i.test(a
            .textContent || ""));
        if (profileA && d.profileSlug) {
          profileA.href = `/doctor-profile/${d.profileSlug}`;
          profileA.target = "_self";
          profileA.rel = "noopener";
        }

        const dirA =
          row.querySelector("[data-directions-link]") || row.querySelector(
            ".is-directions-button");
        if (dirA) {
          dirA.href =
            `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`;
          dirA.target = "_blank";
          dirA.rel = "noopener noreferrer";
        }

        const addrEl =
          row.querySelector("[data-address]") ||
          row.querySelector(".doctor-address-list") ||
          row.querySelector(".doctor-address");
        if (addrEl) {
          addrEl.textContent = TEXT.loadingAddr;
          addrEl.dataset.lat = d.lat;
          addrEl.dataset.lng = d.lng;
          addrEl.dataset.addrPending = "1";
        }

        d.listEl = row;
        frag.appendChild(row);
      });

      wrap.appendChild(frag);
      lazyResolveAddresses(wrap);
    }

    function lazyResolveAddresses(scopeEl) {
      const targets = Array.from(scopeEl.querySelectorAll("[data-addr-pending='1']"));
      if (!targets.length) return;

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            io.unobserve(el);
            el.dataset.addrPending = "0";
            const lat = parseFloat(el.dataset.lat);
            const lng = parseFloat(el.dataset.lng);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              geocodeOnce(lat, lng).then((addr) => {
                el.textContent = addr || TEXT.addrNotFound;
              });
            } else {
              el.textContent = TEXT.addrNotFound;
            }
          });
        }, { root: null, rootMargin: "200px 0px", threshold: 0 }
      );

      targets.forEach((el) => io.observe(el));
    }

    function createMarkersOnce(list) {
      list.forEach((d) => {
        const m = new google.maps.Marker({
          position: { lat: d.lat, lng: d.lng },
          map: null,
          title: d.name,
          optimized: true,
        });
        d.marker = m;
        allMarkers.push(m);

        m.addListener("mouseover", () => {
          tooltipInfoWindow.setContent(
            `<div class="custom-tooltip"><strong>${d.name}</strong><br><span>${
              IS_AR ? "انقر لعرض تفاصيل العيادة" : "Click to view clinic details"
            }</span></div>`
          );
          tooltipInfoWindow.open(map, m);
        });
        m.addListener("mouseout", () => tooltipInfoWindow.close());

        m.addListener("click", () => {
          tooltipInfoWindow.close();

          const node = document.createElement("div");
          node.innerHTML = d.popupContent?.innerHTML || "";

          const popupImg =
            node.querySelector(".map-popup_doctor-info-wrapper img") || node
            .querySelector("img");
          if (popupImg && d.photoEl && d.photoEl.tagName === "IMG") {
            const src = d.photoEl.currentSrc || d.photoEl.src;
            if (src) {
              popupImg.src = src;
              if (d.photoEl.srcset) popupImg.setAttribute("srcset", d.photoEl.srcset);
              else popupImg.removeAttribute("srcset");
              if (d.photoEl.sizes) popupImg.setAttribute("sizes", d.photoEl.sizes);
              else popupImg.removeAttribute("sizes");
              popupImg.alt = d.name || "";
              popupImg.loading = popupImg.loading || "lazy";
            }
          }

          // Remove the template's close button; use Google's InfoWindow close instead
          node.querySelector(".map-popup-close-button")?.remove();

          const dirBtn = node.querySelector(".is-directions-button");
          if (dirBtn) {
            dirBtn.href =
              `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`;
            dirBtn.target = "_blank";
            dirBtn.rel = "noopener noreferrer";
          }

          const addrEl = node.querySelector(".doctor-address-popup") || node
            .querySelector(".doctor-address");
          if (addrEl) {
            addrEl.textContent = TEXT.loadingAddr;
            geocodeOnce(d.lat, d.lng).then((addr) => {
              addrEl.textContent = addr || TEXT.addrNotFound;
            });
          }

          popupInfoWindow.setContent(node);
          popupInfoWindow.open(map, m);
        });
      });
    }
  }
})();