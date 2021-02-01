//GIVEN a weather dashboard with form inputs
//WHEN I search for a city
//THEN I am presented with current and future conditions for that city and that city is added to the search history
//WHEN I view current weather conditions for that city
//THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
//WHEN I view the UV index
//THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
//WHEN I view future weather conditions for that city
//THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
//WHEN I click on a city in the search history
//THEN I am again presented with current and future conditions for that city
//WHEN I open the weather dashboard
//THEN I am presented with the last searched city forecast

//function that fetches city tokens and

//file scope
let recentResults = getRecentResults();
let form = document.querySelector("#form");
form.onsubmit = onSearchClick;
let resultBtns = document.querySelector("#resultBtns");

renderResults();

function getSearchKey() {
  return "WEATHER_SEARCH";
}

async function fetchCity(city, country) {
  let apiKey = "68d528c7d7233697535528349a8a896e";
  //   let citySearch = document.getElementById("cityInput").value;
  //   let countrySearch = document.getElementById("countryInput").value;
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

    result.days.push({
      date: moment().add(i, "days").format("dddd"),
      icon: day.weather["0"].icon,
      temp: day.temp.day,
      humidity: day.humidity,
    });
  }

  console.log(res);

  console.log(result);

  return result;
}

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

  console.log(cityData.days);

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

async function onSearchClick(event) {
  event.preventDefault();
  let country = document.querySelector("#countryInput").value;
  let city = document.querySelector("#cityInput").value;

  let result = await fetchCity(city, country);

  if (result) {
    addSearchHistory(city, country);
    renderResults();
    displayCityData(result);
  } else {
    alert("Get a dog all up in ya");
  }
}

async function search(city, country) {
  let result = await fetchCity(city, country);

  if (result) {
    displayCityData(result);
  } else {
    alert("Get a dog all up in ya");
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

//function to add recent search results to dom
//function addRecentSearch() {
//localStorage.getItem(recentResults);

//add name recent searches to array to store on dom
//
//}

//pass city name and save to local storage
//populate dom with previous search results
//}

//fetchCity("Melbourne", "Aus");

//render to dom
// pass to 5 day forecast
