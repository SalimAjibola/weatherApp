import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, ActivityIndicator, ImageBackground } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

import { OPENWEATHERMAP_API_KEY } from './config';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function requestLocationPermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Weather App Location Permission',
            message: 'Weather App needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            (position) => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;

              axios
                .get(
                  `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}`
                )
                .then((response) => {
                  setWeatherData(response.data);
                  setIsLoading(false);
                })
                .catch((error) => {
                  console.error(error);
                  setIsLoading(false);
                });
            },
            (error) => {
              console.error(error.message);
              setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          console.log('Location permission denied');
          setIsLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setIsLoading(false);
      }
    }

    requestLocationPermission();
  }, []);

  return (
    <ImageBackground source={require('./assets/background.jpg')} style={styles.backgroundImage}>
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : weatherData ? (
        <View style={styles.weatherContainer}>
          <Text style={styles.locationText}>
            {weatherData.name}, {weatherData.sys.country}
          </Text>
          <Text style={styles.tempText}>
            Temperature: {weatherData.main.temp}°C
          </Text>
          <Text style={styles.descriptionText}>
            Weather: {weatherData.weather[0].description}
          </Text>
        </View>
      ) : (
        <Text style={styles.errorText}>Unable to fetch weather data</Text>
      )}
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
  },
  weatherContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  locationText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tempText: {
    fontSize: 16,
  },
  descriptionText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default App;
