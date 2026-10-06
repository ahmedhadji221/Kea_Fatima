const seedTickets = [
  {
    id: "KF-20260919-001",
    createdAt: "2026-09-19",
    name: "Amina Abdallah",
    phone: "+269 361 77 26",
    category: "Réservation",
    route: "Moroni → Majunga",
    travelDate: "2026-09-25",
    passengers: "2",
    luggage: "2 sacs, 50 kg",
    priority: "Urgente",
    status: "En traitement",
    message: "Bonjour, je souhaite réserver deux places pour le prochain départ vers Majunga.",
    reply: "Votre demande est en traitement. Le service réservation va vous contacter.",
  },
  {
    id: "KF-20260919-002",
    createdAt: "2026-09-19",
    name: "Karim Said",
    phone: "+269 332 06 97",
    category: "Bagages",
    route: "Mutsamudu → Majunga",
    travelDate: "2026-09-28",
    passengers: "1",
    luggage: "75 kg",
    priority: "Normale",
    status: "Nouveau",
    message: "Je voudrais confirmer la limite de bagages autorisée avant le voyage.",
    reply: "",
  },
  {
    id: "KF-20260919-003",
    createdAt: "2026-09-19",
    name: "Nadia Moussa",
    phone: "+261 34 07 010 72",
    category: "Prochain départ",
    route: "Majunga → Comores",
    travelDate: "2026-10-02",
    passengers: "3",
    luggage: "À confirmer",
    priority: "Normale",
    status: "Résolu",
    message: "Merci, les informations sur le retour vers les Comores ont bien été reçues.",
    reply: "Le départ retour sera confirmé par le bureau de Majunga.",
  },
];

const menuButton = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
const form = document.querySelector("#requestForm");
const formStatus = document.querySelector("#formStatus");
const ticketList = document.querySelector("#ticketList");
const ticketCount = document.querySelector("#ticketCount");
const tabs = document.querySelectorAll(".tab");
const trackingForm = document.querySelector("#trackingForm");
const trackingResult = document.querySelector("#trackingResult");
const routeLinks = document.querySelectorAll("[data-route]");
const adminStats = document.querySelector("#adminStats");
const adminTicketList = document.querySelector("#adminTicketList");
const adminTabs = document.querySelectorAll(".admin-tab");
const confirmationCard = document.querySelector("#confirmationCard");
const adminLogin = document.querySelector("#adminLogin");
const adminApp = document.querySelector("#adminApp");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminLoginStatus = document.querySelector("#adminLoginStatus");
const adminSearch = document.querySelector("#adminSearch");
const exportCsvBtn = document.querySelector("#exportCsvBtn");
const printBtn = document.querySelector("#printBtn");
const adminLogoutBtn = document.querySelector("#adminLogoutBtn");
const weatherRoute = document.querySelector("#weatherRoute");
const refreshWeather = document.querySelector("#refreshWeather");
const weatherStatus = document.querySelector("#weatherStatus");
const weatherSummary = document.querySelector("#weatherSummary");
const weatherDetails = document.querySelector("#weatherDetails");
const carouselSlides = [...document.querySelectorAll(".hero-slide")];
const carouselDots = [...document.querySelectorAll(".carousel-dot")];
const carouselPause = document.querySelector("[data-carousel-pause]");

let activeFilter = "all";
let adminFilter = "all";
let adminSearchTerm = "";
let tickets = loadTickets();
let carouselIndex = 0;
let carouselTimer = null;
let carouselPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const weatherRoutes = {
  "moroni-majunga": {
    label: "Moroni → Majunga",
    weather: { latitude: -13.72, longitude: 44.78 },
    marine: { latitude: -13.72, longitude: 44.78 },
  },
  "mutsamudu-majunga": {
    label: "Mutsamudu → Majunga",
    weather: { latitude: -13.95, longitude: 45.1 },
    marine: { latitude: -13.95, longitude: 45.1 },
  },
  "majunga-comores": {
    label: "Majunga → Comores",
    weather: { latitude: -13.72, longitude: 44.78 },
    marine: { latitude: -13.72, longitude: 44.78 },
  },
};

function loadTickets() {
  const storedTickets = localStorage.getItem("keaFatimaTickets");

  if (!storedTickets) {
    localStorage.setItem("keaFatimaTickets", JSON.stringify(seedTickets));
    return seedTickets;
  }

  try {
    return JSON.parse(storedTickets).map(normalizeTicket);
  } catch {
    return seedTickets;
  }
}

function normalizeTicket(ticket, index = 0) {
  return {
    id: ticket.id || createTicketId(index + 1),
    createdAt: ticket.createdAt || new Date().toISOString().slice(0, 10),
    name: ticket.name || "Client",
    phone: ticket.phone || ticket.email || "",
    category: ticket.category || "Demande d'information",
    route: ticket.route || "Non précisée",
    travelDate: ticket.travelDate || "Non précisée",
    passengers: ticket.passengers || "1",
    luggage: ticket.luggage || "Non précisé",
    priority: ticket.priority || "Normale",
    status: ticket.status || "Nouveau",
    message: ticket.message || "",
    reply: ticket.reply || "",
  };
}

function createTicketId(offset = 0) {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = String(Date.now() + offset).slice(-4);
  return `KF-${stamp}-${randomPart}`;
}

function saveTickets() {
  localStorage.setItem("keaFatimaTickets", JSON.stringify(tickets));
}

function statusClass(status) {
  if (status === "En traitement") return "progress";
  if (status === "Confirmé") return "confirmed";
  if (status === "Résolu") return "done";
  return "new";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function filteredTickets(filter) {
  const statusMatches = filter === "all" ? tickets : tickets.filter((ticket) => ticket.status === filter);

  if (!adminSearchTerm) return statusMatches;

  return statusMatches.filter((ticket) => {
    const searchable = [
      ticket.id,
      ticket.name,
      ticket.phone,
      ticket.category,
      ticket.route,
      ticket.status,
      ticket.message,
      ticket.reply,
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(adminSearchTerm);
  });
}

function allTicketsForStatus(filter) {
  return filter === "all" ? tickets : tickets.filter((ticket) => ticket.status === filter);
}

function renderTickets() {
  if (!ticketList || !ticketCount) return;

  const visibleTickets = filteredTickets(activeFilter);
  ticketCount.textContent = `${visibleTickets.length} demande${visibleTickets.length > 1 ? "s" : ""}`;

  if (visibleTickets.length === 0) {
    ticketList.innerHTML = `<p class="empty">Aucune demande dans cette catégorie.</p>`;
    return;
  }

  ticketList.innerHTML = visibleTickets.map(ticketCard).join("");
}

function ticketCard(ticket) {
  return `
    <article class="ticket">
      <div>
        <h4>${escapeHtml(ticket.category)} - ${escapeHtml(ticket.name)}</h4>
        <p>${escapeHtml(ticket.message)}</p>
        <p><strong>N° demande :</strong> ${escapeHtml(ticket.id)}</p>
        <p><strong>Ligne :</strong> ${escapeHtml(ticket.route)} · <strong>Date :</strong> ${escapeHtml(ticket.travelDate)}</p>
        <p><strong>Passagers :</strong> ${escapeHtml(ticket.passengers)} · <strong>Bagages :</strong> ${escapeHtml(ticket.luggage)}</p>
        <p><strong>Contact :</strong> ${escapeHtml(ticket.phone)}</p>
        ${ticket.reply ? `<p><strong>Réponse agence :</strong> ${escapeHtml(ticket.reply)}</p>` : ""}
      </div>
      <span class="badge ${statusClass(ticket.status)}">${escapeHtml(ticket.status)}</span>
    </article>
  `;
}

function renderAdmin() {
  if (!adminStats || !adminTicketList) return;

  if (adminApp?.hidden) return;

  const counts = {
    total: tickets.length,
    new: tickets.filter((ticket) => ticket.status === "Nouveau").length,
    progress: tickets.filter((ticket) => ticket.status === "En traitement").length,
    confirmed: tickets.filter((ticket) => ticket.status === "Confirmé").length,
    done: tickets.filter((ticket) => ticket.status === "Résolu").length,
  };

  adminStats.innerHTML = `
    <article><strong>${counts.total}</strong><span>Total demandes</span></article>
    <article><strong>${counts.new}</strong><span>Nouvelles</span></article>
    <article><strong>${counts.progress}</strong><span>En traitement</span></article>
    <article><strong>${counts.confirmed}</strong><span>Confirmées</span></article>
    <article><strong>${counts.done}</strong><span>Résolues</span></article>
  `;

  const visibleTickets = filteredTickets(adminFilter);

  if (visibleTickets.length === 0) {
    adminTicketList.innerHTML = `<p class="empty">Aucune demande pour ce filtre.</p>`;
    return;
  }

  adminTicketList.innerHTML = visibleTickets
    .map(
      (ticket) => `
        <article class="admin-ticket" data-id="${escapeHtml(ticket.id)}">
          <div class="admin-ticket-head">
            <div>
              <span class="ticket-id">${escapeHtml(ticket.id)}</span>
              <h3>${escapeHtml(ticket.category)} - ${escapeHtml(ticket.name)}</h3>
              <p>${escapeHtml(ticket.route)} · ${escapeHtml(ticket.travelDate)} · ${escapeHtml(ticket.passengers)} passager(s)</p>
            </div>
            <span class="badge ${statusClass(ticket.status)}">${escapeHtml(ticket.status)}</span>
          </div>
          <div class="admin-ticket-body">
            <p><strong>Téléphone :</strong> ${escapeHtml(ticket.phone)}</p>
            <p><strong>Bagages :</strong> ${escapeHtml(ticket.luggage)}</p>
            <p><strong>Priorité :</strong> ${escapeHtml(ticket.priority)}</p>
            <p><strong>Message :</strong> ${escapeHtml(ticket.message)}</p>
          </div>
          <label>
            Réponse de l'agence
            <textarea data-reply="${escapeHtml(ticket.id)}" rows="3" placeholder="Écrire une réponse au client...">${escapeHtml(ticket.reply)}</textarea>
          </label>
          <div class="admin-actions">
            <button type="button" data-status="${escapeHtml(ticket.id)}" data-value="Nouveau">Nouveau</button>
            <button type="button" data-status="${escapeHtml(ticket.id)}" data-value="En traitement">En traitement</button>
            <button type="button" data-status="${escapeHtml(ticket.id)}" data-value="Confirmé">Confirmé</button>
            <button type="button" data-status="${escapeHtml(ticket.id)}" data-value="Résolu">Résolu</button>
            <button class="danger-action" type="button" data-delete="${escapeHtml(ticket.id)}">Supprimer</button>
          </div>
        </article>
      `
    )
    .join("");
}

function updateTicket(id, updates) {
  tickets = tickets.map((ticket) => (ticket.id === id ? { ...ticket, ...updates } : ticket));
  saveTickets();
  renderTickets();
  renderAdmin();
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

function showCarouselSlide(index) {
  if (!carouselSlides.length) return;
  carouselIndex = (index + carouselSlides.length) % carouselSlides.length;
  carouselSlides.forEach((slide, itemIndex) => {
    const active = itemIndex === carouselIndex;
    slide.classList.toggle("active", active);
    slide.setAttribute("aria-hidden", String(!active));
  });
  carouselDots.forEach((dot, itemIndex) => {
    const active = itemIndex === carouselIndex;
    dot.classList.toggle("active", active);
    if (active) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
}

function stopCarouselTimer() {
  if (carouselTimer) window.clearInterval(carouselTimer);
  carouselTimer = null;
}

function startCarouselTimer() {
  stopCarouselTimer();
  if (carouselSlides.length > 1 && !carouselPaused && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    carouselTimer = window.setInterval(() => showCarouselSlide(carouselIndex + 1), 6500);
  }
}

document.querySelector("[data-carousel-prev]")?.addEventListener("click", () => {
  showCarouselSlide(carouselIndex - 1);
  startCarouselTimer();
});
document.querySelector("[data-carousel-next]")?.addEventListener("click", () => {
  showCarouselSlide(carouselIndex + 1);
  startCarouselTimer();
});
carouselDots.forEach((dot) => dot.addEventListener("click", () => {
  showCarouselSlide(Number(dot.dataset.carouselTo));
  startCarouselTimer();
}));
carouselPause?.addEventListener("click", () => {
  carouselPaused = !carouselPaused;
  carouselPause.textContent = carouselPaused ? "▶" : "Ⅱ";
  carouselPause.setAttribute("aria-label", carouselPaused ? "Reprendre le carrousel" : "Mettre le carrousel en pause");
  startCarouselTimer();
});
document.querySelector(".hero-carousel")?.addEventListener("mouseenter", stopCarouselTimer);
document.querySelector(".hero-carousel")?.addEventListener("mouseleave", startCarouselTimer);
document.addEventListener("visibilitychange", () => document.hidden ? stopCarouselTimer() : startCarouselTimer());
showCarouselSlide(0);
startCarouselTimer();

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    activeFilter = tab.dataset.filter;
    renderTickets();
  });
});

routeLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const routeSelect = document.querySelector('select[name="route"]');
    if (routeSelect) routeSelect.value = link.dataset.route;
  });
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const ticket = {
      id: createTicketId(),
      createdAt: new Date().toISOString().slice(0, 10),
      name: data.get("name"),
      phone: data.get("phone"),
      category: data.get("category"),
      route: data.get("route"),
      travelDate: data.get("travelDate"),
      passengers: data.get("passengers"),
      luggage: data.get("luggage") || "Non précisé",
      priority: data.get("priority"),
      message: data.get("message"),
      status: "Nouveau",
      reply: "",
    };

    tickets = [ticket, ...tickets];
    saveTickets();
    activeFilter = "all";
    tabs.forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
    renderTickets();

    form.reset();
    formStatus.innerHTML = `Votre demande a été envoyée avec succès. Numéro de suivi : <strong>${escapeHtml(ticket.id)}</strong>`;
    showConfirmation(ticket);
    document.querySelector('input[name="trackingId"]').value = ticket.id;
    document.querySelector('input[name="trackingPhone"]').value = ticket.phone;
    confirmationCard?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

if (trackingForm && trackingResult) {
  trackingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(trackingForm);
    const trackingId = String(data.get("trackingId")).trim().toUpperCase();
    const trackingPhone = String(data.get("trackingPhone")).replace(/\s/g, "");
    const match = tickets.find(
      (ticket) => ticket.id.toUpperCase() === trackingId && ticket.phone.replace(/\s/g, "") === trackingPhone
    );

    if (!match) {
      trackingResult.innerHTML = `<p class="empty">Aucune demande trouvée avec ces informations.</p>`;
      return;
    }

    trackingResult.innerHTML = `
      <article class="tracking-card">
        <span class="badge ${statusClass(match.status)}">${escapeHtml(match.status)}</span>
        <h3>${escapeHtml(match.id)}</h3>
        <p><strong>Ligne :</strong> ${escapeHtml(match.route)}</p>
        <p><strong>Date souhaitée :</strong> ${escapeHtml(match.travelDate)}</p>
        <p><strong>Réponse agence :</strong> ${escapeHtml(match.reply || "Votre demande n'a pas encore reçu de réponse.")}</p>
      </article>
    `;
  });
}

adminTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    adminTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    adminFilter = tab.dataset.filter;
    renderAdmin();
  });
});

if (adminTicketList) {
  adminTicketList.addEventListener("click", (event) => {
    const statusButton = event.target.closest("[data-status]");
    const deleteButton = event.target.closest("[data-delete]");

    if (statusButton) {
      const id = statusButton.dataset.status;
      const reply = document.querySelector(`[data-reply="${CSS.escape(id)}"]`)?.value || "";
      updateTicket(id, { status: statusButton.dataset.value, reply });
    }

    if (deleteButton) {
      tickets = tickets.filter((ticket) => ticket.id !== deleteButton.dataset.delete);
      saveTickets();
      renderAdmin();
    }
  });

  adminTicketList.addEventListener("input", (event) => {
    if (!event.target.matches("[data-reply]")) return;
    tickets = tickets.map((ticket) =>
      ticket.id === event.target.dataset.reply ? { ...ticket, reply: event.target.value } : ticket
    );
    saveTickets();
  });
}

function showConfirmation(ticket) {
  if (!confirmationCard) return;

  confirmationCard.hidden = false;
  confirmationCard.innerHTML = `
    <span class="notice-tag">Demande enregistrée</span>
    <h3>Votre numéro de suivi : ${escapeHtml(ticket.id)}</h3>
    <p>Conservez ce numéro avec votre téléphone pour vérifier l'état de votre demande dans la section suivi client.</p>
    <div class="confirmation-actions">
      <button class="btn secondary light" type="button" data-copy="${escapeHtml(ticket.id)}">Copier le numéro</button>
      <a class="btn primary" href="#suivi-client">Suivre ma demande</a>
    </div>
  `;
}

if (confirmationCard) {
  confirmationCard.addEventListener("click", async (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (!copyButton) return;

    try {
      await navigator.clipboard.writeText(copyButton.dataset.copy);
      copyButton.textContent = "Numéro copié";
    } catch {
      copyButton.textContent = "Copie indisponible";
    }
  });
}

function setAdminSession(isLoggedIn) {
  if (!adminLogin || !adminApp) return;

  adminLogin.hidden = isLoggedIn;
  adminApp.hidden = !isLoggedIn;
  sessionStorage.setItem("keaFatimaAdminLoggedIn", isLoggedIn ? "true" : "false");
  if (isLoggedIn) renderAdmin();
}

if (adminLogin && adminApp) {
  setAdminSession(sessionStorage.getItem("keaFatimaAdminLoggedIn") === "true");
}

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = new FormData(adminLoginForm).get("password");

    if (password === "admin123") {
      adminLoginStatus.textContent = "";
      adminLoginForm.reset();
      setAdminSession(true);
      return;
    }

    adminLoginStatus.textContent = "Mot de passe incorrect.";
  });
}

if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", () => {
    setAdminSession(false);
  });
}

if (adminSearch) {
  adminSearch.addEventListener("input", () => {
    adminSearchTerm = adminSearch.value.trim().toLowerCase();
    renderAdmin();
  });
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportTicketsToCsv() {
  const rows = [
    ["Numero", "Date", "Nom", "Telephone", "Categorie", "Ligne", "Date voyage", "Passagers", "Bagages", "Priorite", "Statut", "Message", "Reponse"],
    ...filteredTickets(adminFilter).map((ticket) => [
      ticket.id,
      ticket.createdAt,
      ticket.name,
      ticket.phone,
      ticket.category,
      ticket.route,
      ticket.travelDate,
      ticket.passengers,
      ticket.luggage,
      ticket.priority,
      ticket.status,
      ticket.message,
      ticket.reply,
    ]),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "demandes-kea-fatima.csv";
  link.click();
  URL.revokeObjectURL(url);
}

if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", exportTicketsToCsv);
}

if (printBtn) {
  printBtn.addEventListener("click", () => window.print());
}

function nearestIndex(times) {
  const now = Date.now();
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  times.forEach((time, index) => {
    const distance = Math.abs(new Date(time).getTime() - now);
    if (distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
  });

  return bestIndex;
}

function numberOrNull(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function formatValue(value, unit = "") {
  const number = numberOrNull(value);
  if (number === null) return "N/D";
  return `${Math.round(number * 10) / 10}${unit}`;
}

function assessMarineRisk(current) {
  const wind = numberOrNull(current.windSpeed) || 0;
  const gusts = numberOrNull(current.windGusts) || 0;
  const waves = numberOrNull(current.waveHeight) || 0;
  const rain = numberOrNull(current.precipitation) || 0;
  const visibility = numberOrNull(current.visibility) || 99999;

  const reasons = [];
  let level = "good";
  let label = "Conditions favorables";

  if (wind >= 35 || gusts >= 50 || waves >= 2.5 || visibility < 3000 || rain >= 10) {
    level = "danger";
    label = "Conditions défavorables";
  } else if (wind >= 22 || gusts >= 35 || waves >= 1.5 || visibility < 7000 || rain >= 3) {
    level = "caution";
    label = "Prudence recommandée";
  }

  if (wind >= 22) reasons.push(`vent ${formatValue(wind, " km/h")}`);
  if (gusts >= 35) reasons.push(`rafales ${formatValue(gusts, " km/h")}`);
  if (waves >= 1.5) reasons.push(`vagues ${formatValue(waves, " m")}`);
  if (visibility < 7000) reasons.push(`visibilité ${formatValue(visibility / 1000, " km")}`);
  if (rain >= 3) reasons.push(`pluie ${formatValue(rain, " mm")}`);

  return {
    level,
    label,
    message: reasons.length
      ? `${label} : ${reasons.join(", ")}.`
      : `${label} pour la ligne sélectionnée selon les données disponibles.`,
  };
}

function fallbackWeather(route) {
  return {
    source: "Données de démonstration",
    route: route.label,
    coordinates: `${route.weather.latitude}, ${route.weather.longitude}`,
    current: {
      time: new Date().toISOString(),
      temperature: 28,
      windSpeed: 18,
      windGusts: 28,
      windDirection: 110,
      precipitation: 0.6,
      visibility: 12000,
      pressure: 1012,
      humidity: 74,
      waveHeight: 1.1,
      waveDirection: 120,
      wavePeriod: 6,
      swellHeight: 0.8,
      seaTemperature: 27,
      oceanCurrentVelocity: 0.28,
    },
    hourly: Array.from({ length: 6 }, (_, index) => ({
      time: new Date(Date.now() + index * 3 * 60 * 60 * 1000).toISOString(),
      windSpeed: 18 + index,
      windGusts: 28 + index,
      precipitation: index > 3 ? 2.2 : 0.5,
      visibility: 12000 - index * 700,
      waveHeight: 1.1 + index * 0.08,
      wavePeriod: 6,
      seaTemperature: 27,
    })),
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function loadWeather() {
  if (!weatherRoute || !weatherStatus || !weatherSummary || !weatherDetails) return;

  const route = weatherRoutes[weatherRoute.value];
  weatherStatus.className = "weather-status";
  weatherStatus.textContent = `Chargement de la météo pour ${route.label}...`;
  weatherSummary.innerHTML = "";
  weatherDetails.innerHTML = "";

  try {
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: route.weather.latitude,
      longitude: route.weather.longitude,
      current: "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
      hourly: "temperature_2m,precipitation,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure",
      forecast_days: "2",
      timezone: "auto",
    });

    const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
    marineUrl.search = new URLSearchParams({
      latitude: route.marine.latitude,
      longitude: route.marine.longitude,
      current: "wave_height,wave_direction,wave_period,swell_wave_height,sea_surface_temperature,ocean_current_velocity",
      hourly: "wave_height,wave_direction,wave_period,swell_wave_height,sea_surface_temperature,ocean_current_velocity",
      forecast_days: "2",
      timezone: "auto",
    });

    const [weatherData, marineData] = await Promise.all([fetchJson(weatherUrl), fetchJson(marineUrl)]);
    const weatherIndex = nearestIndex(weatherData.hourly.time);
    const marineIndex = nearestIndex(marineData.hourly.time);

    renderWeather({
      source: "Open-Meteo",
      route: route.label,
      coordinates: `${route.weather.latitude}, ${route.weather.longitude}`,
      current: {
        time: weatherData.current.time,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        precipitation: weatherData.current.precipitation,
        pressure: weatherData.current.surface_pressure,
        windSpeed: weatherData.current.wind_speed_10m,
        windDirection: weatherData.current.wind_direction_10m,
        windGusts: weatherData.current.wind_gusts_10m,
        visibility: weatherData.hourly.visibility[weatherIndex],
        waveHeight: marineData.current.wave_height,
        waveDirection: marineData.current.wave_direction,
        wavePeriod: marineData.current.wave_period,
        swellHeight: marineData.current.swell_wave_height,
        seaTemperature: marineData.current.sea_surface_temperature,
        oceanCurrentVelocity: marineData.current.ocean_current_velocity,
      },
      hourly: weatherData.hourly.time.slice(weatherIndex, weatherIndex + 8).map((time, index) => {
        const weatherHour = weatherIndex + index;
        const marineHour = marineIndex + index;
        return {
          time,
          windSpeed: weatherData.hourly.wind_speed_10m[weatherHour],
          windGusts: weatherData.hourly.wind_gusts_10m[weatherHour],
          precipitation: weatherData.hourly.precipitation[weatherHour],
          visibility: weatherData.hourly.visibility[weatherHour],
          waveHeight: marineData.hourly.wave_height[marineHour],
          wavePeriod: marineData.hourly.wave_period[marineHour],
          seaTemperature: marineData.hourly.sea_surface_temperature[marineHour],
        };
      }),
    });
  } catch {
    renderWeather(fallbackWeather(route));
  }
}

function renderWeather(data) {
  const risk = assessMarineRisk(data.current);
  weatherStatus.className = `weather-status ${risk.level}`;
  weatherStatus.textContent = `${risk.message} Source : ${data.source}.`;

  weatherSummary.innerHTML = `
    <article class="weather-card">
      <span>Vent</span>
      <strong>${formatValue(data.current.windSpeed, " km/h")}</strong>
      <small>Rafales : ${formatValue(data.current.windGusts, " km/h")} · Direction : ${formatValue(data.current.windDirection, "°")}</small>
    </article>
    <article class="weather-card">
      <span>Mer</span>
      <strong>${formatValue(data.current.waveHeight, " m")}</strong>
      <small>Houle : ${formatValue(data.current.swellHeight, " m")} · Période : ${formatValue(data.current.wavePeriod, " s")}</small>
    </article>
    <article class="weather-card">
      <span>Pluie et visibilité</span>
      <strong>${formatValue(data.current.precipitation, " mm")}</strong>
      <small>Visibilité : ${formatValue((numberOrNull(data.current.visibility) || 0) / 1000, " km")}</small>
    </article>
    <article class="weather-card">
      <span>Atmosphère</span>
      <strong>${formatValue(data.current.temperature, "°C")}</strong>
      <small>Humidité : ${formatValue(data.current.humidity, "%")} · Pression : ${formatValue(data.current.pressure, " hPa")}</small>
    </article>
    <article class="weather-card">
      <span>Température de mer</span>
      <strong>${formatValue(data.current.seaTemperature, "°C")}</strong>
      <small>Courant : ${formatValue(data.current.oceanCurrentVelocity, " m/s")}</small>
    </article>
    <article class="weather-card">
      <span>Ligne analysée</span>
      <strong>${escapeHtml(data.route)}</strong>
      <small>Dernière mise à jour : ${new Date(data.current.time).toLocaleString("fr-FR")}</small>
      <small>Point météo : ${escapeHtml(data.coordinates || "centre de la traversée")}</small>
    </article>
  `;

  weatherDetails.innerHTML = `
    <table class="weather-table">
      <thead>
        <tr>
          <th>Heure</th>
          <th>Vent</th>
          <th>Rafales</th>
          <th>Vagues</th>
          <th>Période</th>
          <th>Pluie</th>
          <th>Visibilité</th>
          <th>Mer</th>
        </tr>
      </thead>
      <tbody>
        ${data.hourly
          .map(
            (hour) => `
              <tr>
                <td>${new Date(hour.time).toLocaleString("fr-FR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td>${formatValue(hour.windSpeed, " km/h")}</td>
                <td>${formatValue(hour.windGusts, " km/h")}</td>
                <td>${formatValue(hour.waveHeight, " m")}</td>
                <td>${formatValue(hour.wavePeriod, " s")}</td>
                <td>${formatValue(hour.precipitation, " mm")}</td>
                <td>${formatValue((numberOrNull(hour.visibility) || 0) / 1000, " km")}</td>
                <td>${formatValue(hour.seaTemperature, "°C")}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

if (refreshWeather) {
  refreshWeather.addEventListener("click", loadWeather);
}

if (weatherRoute) {
  weatherRoute.addEventListener("change", loadWeather);
  loadWeather();
}

renderTickets();
renderAdmin();
