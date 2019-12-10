import './Clock.css';

import React, { useEffect, useState } from 'react';

import Notification from './Notification';

const WEATHER_FORECAST_URL = 'https://api.weather.gov/gridpoints/SEW/130,67/forecast';

function useInterval(fn, intervalMS = 1000) {
  useEffect(() => {
    if (fn && intervalMS) {
      const interval = setInterval(fn, intervalMS);

      return () => clearInterval(interval);
    }
  }, [fn, intervalMS]);
}

const Clock = () => {
  const [clock, setClock] = useState(Date.now());
  const [temperatureInFahrenheit, setTemperatureInFahrenheit] = useState();

  useEffect(() => {
    (async () => {
      const res = await fetch(WEATHER_FORECAST_URL, {
        headers: { accept: 'application/geo+json' }
      });

      if (res.ok) {
        const {
          properties: {
            periods: [firstPeriod]
          }
        } = await res.json();

        setTemperatureInFahrenheit(firstPeriod.temperature);
      }
    })();
  }, []);

  useInterval(() => setClock(Date.now()), 1000);

  return (
    <div className="App-Clock">
      <div className="App-Clock-Text">
        {Intl.DateTimeFormat('en-US', { hour12: false, timeStyle: 'short' }).format(new Date(clock))}
      </div>
      {!!temperatureInFahrenheit && <Notification icon="PartlyCloudyDay">{temperatureInFahrenheit}&deg;F</Notification>}
      <Notification icon="Mail">2</Notification>
      <Notification icon="SkypeForBusinessLogo">1</Notification>
    </div>
  );
};

export default Clock;
