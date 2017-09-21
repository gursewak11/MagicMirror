/* global Class */

/* Magic Mirror
 * Module: Weather
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 * 
 * This class is the blueprint for a weather provider.
 */


/**
 * Base BluePrint for the WeatherProvider
 */
var WeatherProvider = Class.extend({
	// Weather Provider Properties
	providerName: null,

	// The following properties have accestor methods.
	// Try to not access them directly.
	currentWeatherDay: null,
	weatherForecastArray: null,

	// The following properties will be set automaticly.
	// You do not need to overwrite these properties.
	config: null,
	delegate: null,
	providerIdentifier: null,


	// Weather Provider Methods
	// All the following methods can be overwrited, although most are good as they are.

	// Called when a weather provider is initialized.
	init: function(config) {
		this.config = config;
		Log.info("Weather provider: " + this.providerName + " initialized.")
	},

	// Called to set the config, this config is the same as the weather module's config.
	setConfig: function(config) {
		this.config = config
		Log.info("Weather provider: " + this.providerName + " config set.", this.config)
	},

	// Called when the weather provider is about to start.
	start: function(config) {
		Log.info("Weather provider: " + this.providerName + " started.")
	},

	// This method should start the API request to fetch the current weather.
	// This method should definetly be overwritten in the provider.
	fetchCurrentWeather: function() {
		Log.warn("Weather provider: " + this.providerName + " does not subclass the fetchCurrentWeather method.")
	},

	// This method should start the API request to fetch the weather forecast.
	// This method should definetly be overwritten in the provider.
	fetchWeatherForeCast: function() {
		Log.warn("Weather provider: " + this.providerName + " does not subclass the fetchWeatherForeCast method.")
	},

	// This returns a WeatherDay object for the current weather.
	currentWeather: function() {
		return this.currentWeatherDay
	},

	// This returns an array of WeatherDay objects for the weather forecast.
	weatherForecast: function() {
		return this.weatherForecastArray
	},

	// Set the currentWeather and notify the delegate that new information is availabe.
	setCurrentWeather: function(currentWeatherDay) {
		// We should check here if we are passing a WeatherDay
		this.currentWeatherDay = currentWeatherDay

		this.updateAvailable()
	},

	// Notify the delegate that new weather is available.
	updateAvailable: function() {
		this.delegate.updateAvailable(this)
	},

	// A convinience function to make requests. It returns a promise.
	fetchData: function(url, method = "GET", data = null) {
		return new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			request.open(method, url, true);
			request.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						resolve(JSON.parse(this.response));
					} else {
						reject(request)
					}
				}
			};
			request.send();
		})
	}
});

/**
 * Collection of registered weather providers.
 */
WeatherProvider.providers = []

/**
 * Static method to register a new weather provider.
 */
WeatherProvider.register = function(providerIdentifier, providerDetails) {
	WeatherProvider.providers[providerIdentifier.toLowerCase()] = WeatherProvider.extend(providerDetails)
}

/**
 * Static method to initialize a new weather provider.
 */
WeatherProvider.initialize = function(providerIdentifier, delegate) {
	providerIdentifier = providerIdentifier.toLowerCase()

	var provider = new WeatherProvider.providers[providerIdentifier]()

	provider.delegate = delegate
	provider.setConfig(delegate.config)

	provider.providerIdentifier = providerIdentifier;
	if (!provider.providerName) {
		provider.providerName = providerIdentifier
	}

	return provider;
}