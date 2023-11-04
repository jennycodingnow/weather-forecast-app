"use strict";

const state = {
  name: "Denver",
  temp: 20,
  lat: 39.7392,
  lon: -104.9903,
  condition: "Snow",
};

const updateTempLabel = () => {
  const tempLabel = document.getElementById("tempLabel");
  tempLabel.textContent = `${state.temp}°F`;
};

const updateCondLabel = () => {
  const condLabel = document.getElementById("weatherCondition");
  condLabel.textContent = `${state.condition}`;
};

const updateCityLabel = () => {
  const citySearch = document.getElementById("cityLabel");
  citySearch.textContent = `${state.name}`;
};

const updateCityInLabel = () => {
  getLatAndLong();
  updateCity();
  updateCityLabel();
  getTodayDate();
};

const updateCity = () => {
  const searchFieldInput = document.getElementById("citySearch");
  state.name = searchFieldInput.value;
};

const registerEventHandlers = () => {
  const submitCityButton = document.getElementById("submitCity");
  submitCityButton.addEventListener("click", updateCityInLabel);

  const citySearchEl = document.getElementById("citySearch");
  citySearchEl.addEventListener("input", updateCity);
  citySearchEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default form submission behavior
      updateCityLabel();
      submitCityButton.click();
    }
  });
};

document.addEventListener("DOMContentLoaded", registerEventHandlers);

const getWeatherCond = (code) => {
  switch (true) {
    case code == 0:
      return "Clear";
    case code <= 10:
      return "Clouds";
    case code <= 49:
      return "Foggy";
    case code <= 55:
      return "Drizzle";
    case code <= 59:
      return "Freezing Drizzle";
    case code <= 65:
      return "Rain";
    case code <= 69:
      return "Freezing Rain";
    case code <= 75:
      return "Snow";
    case code == 77:
      return "Snow Grains";
    case code <= 82:
      return "Rain Showers";
    case code <= 86:
      return "Snow Showers";
    case code == 99:
      return "Thunderstorm";
    default:
      return null; // Return null for unrecognized codes
  }
};

const getTodayDate = () => {
  const currentDate = new Date();
  const options = { weekday: "long" };
  const dayOfWeek = currentDate.toLocaleDateString("en-US", options);
  const today = document.getElementById("dayLabel");
  today.textContent = dayOfWeek;
};

const getLatAndLong = () => {
  if (state.name.length < 2) {
    console.log(
      "Search term should have at least two characters for an exact match."
    );
    return;
  }
  // Clear any existing error messages
  clearErrorMessage();

  axios
    .get("https://geocoding-api.open-meteo.com/v1/search?", {
      params: {
        name: state.name,
      },
    })
    .then((response) => {
      console.log("this response:", response);
      if (response.data.results.length > 0) {
        const firstLocation = response.data.results[0];
        state.lat = firstLocation.latitude;
        state.lon = firstLocation.longitude;
        getRealTimeWeather();
      } else {
        console.log("Location not found");
        displayErrorMessage("City not found. Please enter a valid city name");
      }
    })
    .catch((error) => {
      console.log("Error finding latitude and longitude,", error);
      displayErrorMessage("City not found. Please enter a valid city name");
    });
};

const displayErrorMessage = (message) => {
  const errorMessageContainer = document.getElementById("errorMessage");
  const errorMessageElement = document.createElement("span");
  errorMessageElement.textContent = message;
  errorMessageContainer.appendChild(errorMessageElement);
};
const clearErrorMessage = () => {
  const errorMessageContainer =
    document.getElementsByClassName("error-message");
  console.log(errorMessageContainer);
  errorMessageContainer.textContent = " "; // Clear existing error messages
};
const getRealTimeWeather = () => {
  axios
    .get("https://api.open-meteo.com/v1/forecast?", {
      params: {
        latitude: state.lat,
        longitude: state.lon,
        current_weather: true,
      },
    })
    .then((response) => {
      console.log("weather response", response);
      let tempInCelsius = response.data.current_weather.temperature;
      let realTimeWeather = Math.ceil((tempInCelsius * 9) / 5 + 32);
      state.temp = realTimeWeather;
      updateTempLabel();

      let code = response.data.current_weather.weathercode;
      let weatherCondition = getWeatherCond(code);
      state.condition = weatherCondition;
      updateCondLabel();
    })
    .catch((error) => {
      console.log(`Error in real time weather: ${error}`);
    });
};
