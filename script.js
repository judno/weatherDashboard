//file scope
let recentResults = getRecentResults();
let form = document.querySelector("#form");
form.onsubmit = onSearchClick;
let resultBtns = document.querySelector("#resultBtns");

renderResults();
//set key
function getSearchKey() {
  return "WEATHER_SEARCH";
}
// query api
async function fetchCity(city, country) {
  let apiKey = "68d528c7d7233697535528349a8a896e";
  let weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`;

  let result = { city };

  // Call current weather API
  let res = await fetch(weatherApi);

  if (!res.ok) {
    return false;
  }

  res = await res.json();

  result.temp = res.main.temp;
  result.humidity = res.main.humidity;
  result.windspeed = res.wind.speed;
  result.coord = res.coord;
  result.icon = res.weather["0"].icon;

  // Call One call API, get the uv index and the forecast day information for the result
  let onecallAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${result.coord.lat}&lon=${result.coord.lon}&appid=${apiKey}&units=metric`;

  res = await fetch(onecallAPI).then((res) => res.json());
  result.uvi = res.current.uvi;
  result.days = [];

  // loop through first 5 of the 7 day forecast and extract important information
  for (i = 1; i < 6; i++) {
    let day = res.daily[i];

    // push results
    result.days.push({
      date: moment().add(i, "days").format("dddd"),
      icon: day.weather["0"].icon,
      temp: day.temp.day,
      humidity: day.humidity,
    });
  }

  return result;
}
//display all the values with correct iterations and data
function displayCityData(cityData) {
  let cityName = document.querySelector("#cityName");
  let temprature = document.querySelector("#temprature");
  let humidity = document.querySelector("#humidity");
  let windspeen = document.querySelector("#windspeen");
  let uvIndex = document.querySelector("#uvIndex");

  cityName.innerHTML = `${cityData.city} <img src="https://openweathermap.org/img/wn/${cityData.icon}@2x.png" />`;
  temprature.innerHTML = `Temperature: ${cityData.temp}°C`;
  humidity.innerHTML = `Humidity: ${cityData.humidity}%`;
  windspeen.innerHTML = `Windspeed: ${cityData.windspeed} KPH`;
  uvIndex.innerHTML = `UV Index: ${cityData.uvi}`;

  for (i = 0; i < cityData.days.length; i++) {
    let day = cityData.days[i];
    let date = document.querySelector(`#forecast-${i + 1} > .date`);
    let icon = document.querySelector(`#forecast-${i + 1} > .icon`);
    let temp = document.querySelector(`#forecast-${i + 1} > .temp`);
    let humid = document.querySelector(`#forecast-${i + 1} > .humid`);

    date.innerHTML = day.date;
    icon.innerHTML = `<img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" />`;
    temp.innerHTML = `Temperature: ${day.temp}°C`;
    humid.innerHTML = `Humidity: ${day.humidity}%`;
  }
}

// search function
async function onSearchClick(event) {
  event.preventDefault();
  let country = document.querySelector("#countryInput").value;
  let city = document.querySelector("#cityInput").value;

  let result = await fetchCity(city, country);
  // display result add to previous search history
  if (result) {
    addSearchHistory(city, country);
    renderResults();
    displayCityData(result);
  } else {
  }
}
// async function to call search and display results
async function search(city, country) {
  let result = await fetchCity(city, country);

  if (result) {
    displayCityData(result);
  } else {
  }
}
function clickOldResults(event) {
  search(event.target.dataset.city, event.target.dataset.country);
}

function getRecentResults() {
  // read recent searches from localstoirage
  let resultsString = localStorage.getItem(getSearchKey());
  // parse searched into array

  // return them or empty array
  return JSON.parse(resultsString) ?? [];
}

//capture the name of country and city and send to local storage

function addSearchHistory(city, country) {
  let searchResults = { city, country };

  // remove duplicates
  recentResults = recentResults.filter((result) => {
    return !(result.city === city && result.country === country);
  });

  //add to start of array
  recentResults.splice(0, 0, searchResults);

  localStorage.setItem(getSearchKey(), JSON.stringify(recentResults));
}
// render results to homepage
function renderResults() {
  resultBtns.innerHTML = "";

  for (i = 0; i < recentResults.length; i++) {
    let recentSearchButton = document.createElement("button");
    recentSearchButton.dataset.city = recentResults[i].city;
    recentSearchButton.dataset.country = recentResults[i].country;

    recentSearchButton.addEventListener("click", clickOldResults);
    if (recentResults[i].country) {
      recentSearchButton.innerHTML = `${recentResults[i].city}, ${recentResults[i].country}`;
    } else {
      recentSearchButton.innerHTML = recentResults[i].city;
    }
    resultBtns.appendChild(recentSearchButton);
  }
}

// Default to melbourne
search("Melbourne", "AU");
