const cities = {
  Bogota: { name: 'Bogotá', lat: 4.6097, lon: -74.0817 },
  Medellin: { name: 'Medellín', lat: 6.2518, lon: -75.5636 },
  Cali: { name: 'Cali', lat: 3.4516, lon: -76.5319 },
  Barranquilla: { name: 'Barranquilla', lat: 10.9685, lon: -74.7813 },
  Bucaramanga: { name: 'Bucaramanga', lat: 7.1254, lon: -73.1198 },
};

function template(cityKey, weather) {
  const city = cities[cityKey];
  const temp = weather?.temperature;
  const wind = weather?.windspeed;
  const code = weather?.weathercode;
  const label = typeof code === 'number' ? codeToLabel(code) : '—';
  return `
    <div class="weather-card">
      <strong>${city.name}</strong>
      <span class="badge">${temp ?? '—'}°C</span>
      <span class="small">${label}</span>
      <span class="small">Viento: ${wind ?? '—'} km/h</span>
    </div>
  `;
}

function codeToLabel(code) {
  // Simplificado según Open‑Meteo
  if ([0].includes(code)) return 'Despejado';
  if ([1, 2].includes(code)) return 'Parcial nublado';
  if ([3].includes(code)) return 'Nublado';
  if ([45, 48].includes(code)) return 'Niebla';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Llovizna';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Lluvia';
  if ([71, 73, 75, 77].includes(code)) return 'Nieve';
  if ([80, 81, 82].includes(code)) return 'Chubascos';
  if ([95, 96, 99].includes(code)) return 'Tormenta';
  return 'Clima';
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener clima');
  const data = await res.json();
  return data.current_weather;
}

export function mountWeather(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const select = document.createElement('select');
  select.className = 'input';
  select.style.maxWidth = '180px';
  select.title = 'Ciudad';
  for (const key of Object.keys(cities)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = cities[key].name;
    select.appendChild(opt);
  }
  container.appendChild(select);
  const card = document.createElement('div');
  card.id = 'weather-card';
  container.appendChild(card);

  async function update() {
    const key = select.value;
    const { lat, lon } = cities[key];
    try {
      const current = await fetchWeather(lat, lon);
      card.innerHTML = template(key, current);
    } catch (e) {
      card.innerHTML = `<div class="weather-card">No disponible</div>`;
    }
  }

  select.addEventListener('change', update);
  select.value = 'Bogota';
  update();
}