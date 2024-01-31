$(document).ready(function () {
  // DOM
  const API_KEY = "9bbf59d98d47f829b74bad25a2ff1bd2";
  const weatherToday = $("#today");
  const weatherForecast = $("#forecast");
  const searchButton = $("#search-button");
  const cityInput = $("#search-input");
  const citiesButtons = $("#history");
  const clearAllButton = $("<button>")
    .text("Clear All")
    .addClass("btn btn-danger mt-3")
    .attr("id", "clear-all");

  // Initialise Local Storage / Retrieve cities
  function initializeLocalStorage() {
    let cityFromLS = localStorage.getItem("city");
    cityFromLS = cityFromLS ? JSON.parse(cityFromLS) : [];
    return cityFromLS;
  }

  // Save city upon submission
  function saveCity(event, city) {
    event.preventDefault();
    const cityFromLS = initializeLocalStorage();

    if (city !== "" && !cityFromLS.includes(city)) {
      cityFromLS.push(city);
      localStorage.setItem("city", JSON.stringify(cityFromLS));
      renderCities();
    }

    fetchCurrentWeather(city);
  }

  // Fetch current weather API
  function fetchCurrentWeather(city) {
    const queryURL =
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&units=metric&appid=${API_KEY}`;

    fetch(queryURL)
      .then(response => response.json())
      .then(data => {
        renderForecast(data.coord.lat, data.coord.lon);
        displayCurrentWeather(city, data);
      });
  }

  // Display current weather for selected city
  function displayCurrentWeather(city, data) {
    weatherToday.removeClass("d-none");
    const weatherTodayIcon = data.weather[0].icon;
    const todayIcon = `<img src="https://openweathermap.org/img/wn/${weatherTodayIcon}@2x.png"/>`;
    weatherToday.html(`<h3><b>${city} (${dayjs().format("DD/MM/YYYY")})</b>${todayIcon}</h3>
      <p>Temp: ${data.main.temp.toFixed(2)} °C</p>
      <p>Wind: ${(data.wind.speed * 3.6).toFixed(2)} KPH</p>
      <p>Humidity: ${data.main.humidity}%</p>`);
  }

  // Display cities from local storage
  function renderCities() {
    citiesButtons.empty();
    const cityFromLS = initializeLocalStorage();

    cityFromLS.forEach(city => {
      const newCityButton = $("<button>")
        .text(city)
        .attr("style", "background-color: #AEAEAE; padding:10px; border: none; border-radius: 5px")
        .addClass("new-city-btn");

      newCityButton.on("click", event => {
        const cityName = $(event.currentTarget).text();
        saveCity(event, cityName);
      });

      citiesButtons.append(newCityButton);
    });

    // Clear all button
    citiesButtons.append(clearAllButton);
    clearAllButton.on("click", clearAllCities);
  }

  // Clear all cities from local storage
  function clearAllCities() {
    localStorage.removeItem("city");
    renderCities();
  }

  // Display 5 day forecast for selected city
  function renderForecast(lat, lon) {
    const queryURLForecast =
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    fetch(queryURLForecast)
      .then(response => response.json())
      .then(data => {
        weatherForecast.html("<h5><b>5-Day Forecast: </b></h5>");

        for (let i = 7; i < data.list.length; i += 7) {
          const forecastItem = data.list[i];
          const formattedDate = dayjs(forecastItem.dt_txt).format("DD/MM/YYYY");
          const forecastCardIcon = forecastItem.weather[0].icon;

          const forecastCard = `<div class="card border border-white" style="width: 20%;">
            <div class="card-body text-white" style="background-color: #2D3E50">
              <h5 class="card-title">${formattedDate}</h5>
              <p class="card-text"><img src="https://openweathermap.org/img/wn/${forecastCardIcon}@2x.png"/></p>
              <p class="card-text">Temp: ${forecastItem.main.temp} °C</p>
              <p class="card-text">Wind: ${forecastItem.wind.speed} KPH</p>
              <p class="card-text">Humidity: ${forecastItem.main.humidity} %</p>
            </div>
          </div>`;

          weatherForecast.append(forecastCard);
        }
      });
  }

  // Event Listener for search button
  searchButton.on("click", event => {
    const cityValue = cityInput.val();
    saveCity(event, cityValue);
  });

  // City render
  renderCities();
});
