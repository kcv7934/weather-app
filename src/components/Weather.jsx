import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_URL = import.meta.env.VITE_WEATHER_API_URL;
const WEATHER_GEO_API_URL = import.meta.env.VITE_WEATHER_GEO_API_URL;
const LIMIT = 5;
const TEMPTHRESHOLD = 55;
const DEFAULTLAT = 40.7128;
const DEFAULTLON = -74.0060;

const US_STATE_ABBREVIATIONS = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY'
};

const Weather = () => {
  const [city, setCity] = useState('New York City, NY, USA'); 
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null); 
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('New York City, NY, USA');

  const fetchWeatherSuggestions = async (e) => {
    setCity(e.target.value);
    if (e.target.value.length >= 3) {
      try {
        const response = await axios.get(WEATHER_GEO_API_URL, {
          params: {
            q: e.target.value,
            limit: LIMIT,
            appid: WEATHER_API_KEY,
          },
        });
        setSuggestions(response.data);
        setError('');
      } catch (error) {
        setError(error);
        setSuggestions([]);
      }
    }
    else {
      setSuggestions([]);
    }
  }

  const handleCitySelection = (city) => {
    setCity(`${city.name}, ${US_STATE_ABBREVIATIONS[city.state] || ''} ${city.country}`);
    setSelectedCity(city);
    setSuggestions([]);
  }

  const handleSearchClick = async () => {
    if (selectedCity) {
      const lat = selectedCity.lat;
      const lon = selectedCity.lon;
      try {
        const response = await axios.get(WEATHER_API_URL, {
          params: {
            lat: lat,
            lon: lon,
            appid: WEATHER_API_KEY,
            units: 'imperial',
          },
        });
        console.log(response.data);
        setWeatherData(response.data);
        setError('');
        setCityName(`${selectedCity.name}, ${US_STATE_ABBREVIATIONS[selectedCity.state] || ''} ${selectedCity.country}`);
        setSelectedCity(null); 
      } catch (error) {
        setError(error);
        setWeatherData(null);
      }
    }
    else {
      setError('Please select a city from the suggestions');
    }
  }

  const weatherIcon = (icon) => {
    switch(icon.toLowerCase()) {
      case 'clear':
        return './sunny.png';
      case 'rain':
      case 'drizzle':
        return './storm.png';
      case 'thunderstorm':
        return './thunderstorm.png';
      case 'snow':
        return './snow.png';
      default:
        return './cloudy.png';
    }
  }

  const isTemperatureCold = (temp) => {
    return temp <= TEMPTHRESHOLD;
  }

  useEffect(() => {
    async function fetchDefaultWeather() {
      try {
        const response = await axios.get(WEATHER_API_URL, {
          params: {
            lat: DEFAULTLAT,
            lon: DEFAULTLON,
            appid: WEATHER_API_KEY,
            units: 'imperial',
          },
        });
        setWeatherData(response.data);
        setError('');
      }
      catch(error) {
        setError(error);
        setWeatherData(null);
      }
    }
    fetchDefaultWeather();
  }, []);


  return(
  <div className='card'>
    <div className="search-bar">
      <div className="row">
        <input type='text' placeholder='Enter city name' value={city} onChange={fetchWeatherSuggestions}/>
        <button onClick={handleSearchClick}><FontAwesomeIcon icon={faMagnifyingGlass}/></button>
      </div>
      <div className="result-box">
        {error && <p>{error}</p>}
        {city.length >= 3 && suggestions.length > 0 && (
          <ul>
            {suggestions.map((city) => (
              <li key={city.id} onClick={() => handleCitySelection(city)}>
                {city.name}, {US_STATE_ABBREVIATIONS[city.state] || ''} {city.country}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
    {weatherData && (
      <div className="weather-data">
        <img src={weatherIcon(weatherData.weather[0].main)}/>
        <h2>{cityName}</h2>
        <div className="temp">
          <h3>{weatherData.main.temp.toFixed(0)}&deg;F</h3>
          <img 
            src={isTemperatureCold(weatherData.main.temp) ? './cold-temp.png' : './hot-temp.png'}
            />
        </div>
        <div className="weather-details">
          <div className="humidity">
            <img src='./humidity.png'/>
            <p>Humidity {weatherData.main.humidity}%</p>
          </div>
          <div className="wind-speed">
            <img src='./wind-speed.png'/>
            <p>Wind Speed {weatherData.wind.speed.toFixed(0)} mph</p>
          </div>
        </div>
      </div>
    )}
  </div>)
};

export default Weather;


