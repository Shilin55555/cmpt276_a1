// get elements
const city_select = document.querySelector("#citySelect");
const view_button = document.querySelector("#viewCityBtn");
const loading_spin = document.querySelector(".load");
const error_spin = document.querySelector(".error");
const values = document.querySelectorAll(".weather .weather_body .value");

// helpers
function showLoading() {
  loading_spin.classList.remove("hid");
}
function hideLoading() {
  loading_spin.classList.add("hid");
}
function showError(msg) {
  error_spin.textContent = msg;
  error_spin.classList.remove("hid");
}
function clearError() {
  error_spin.textContent = "";
  error_spin.classList.add("hid");
}

function setWeather(city, tempC, windKph, desc) {
  values[0].textContent = city;
  values[1].textContent = `${tempC} °C`;
  values[2].textContent = `${windKph} km/h`;
  values[3].textContent = desc;
}

function codeToText(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 71 && code <= 75) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code === 95) return "Thunderstorm";
  return "Other Weather";
}

async function readErrorReason(res) {
  try {
    const data = await res.json();
    if (data && data.reason) 
      return data.reason;
    return `HTTP ${res.status}`;
  } 
  catch {
    return `HTTP ${res.status}`;
  }
}

// api
// Geocoding API _ Open-Meteo.com
async function geocodeCity(cityName) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    "?name=" + encodeURIComponent(cityName) +
    "&count=10" +
    "&language=en" +
    "&format=json";

  const res = await fetch(url);
  if (!res.ok) {
    const reason = await readErrorReason(res);
    throw new Error(`Geocoding failed: ${reason}`);
  }

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }

  const city = data.results[0];

  return {
    lat: city.latitude,
    lon: city.longitude
  };
}

// GEM API _ Open-Meteo.com
async function fetchCurrentWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + encodeURIComponent(lat) +
    "&longitude=" + encodeURIComponent(lon) +
    "&current=temperature_2m,wind_speed_10m,weather_code" +
    "&temperature_unit=celsius" +
    "&wind_speed_unit=kmh";

  const res = await fetch(url);
  if (!res.ok) {
    const reason = await readErrorReason(res);
    throw new Error(`Weather fetch failed: ${reason}`);
  }

  const data = await res.json();

  if (!data.current) {
    throw new Error("Weather data missing (no current field).");
  }

  return {
    tempC: data.current.temperature_2m,
    windKph: data.current.wind_speed_10m,
    desc: codeToText(data.current.weather_code),
  };
}

// top 10 city
async function loadCityWeather(city) {
  clearError();
  showLoading();

  try {
    const loc = await geocodeCity(city);
    const w = await fetchCurrentWeather(loc.lat, loc.lon);
    setWeather(city, w.tempC, w.windKph, w.desc);
  } 
  catch (err) {
    console.error(err);
    showError(err && err.message ? err.message : "Failed to fetch weather data.");
  } 
  finally {
    hideLoading();
  }
}

// call back function
async function foo() {
  const city = city_select.value.trim();
  await loadCityWeather(city);
}
view_button.addEventListener("click", foo);

const top10Pills = document.querySelectorAll(".pill");

async function onTop10Click(e) {
  const city = e.target.textContent.trim();
  await loadCityWeather(city);
}
// event trigger
for (var i = 0; i < top10Pills.length; i++) {
  var pill = top10Pills[i];
  pill.addEventListener("click", onTop10Click);
}
