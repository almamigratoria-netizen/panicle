L.Control.Weather = L.Control.extend({
  options: {
    position: "bottomleft",
    units: "internal",
    lang: "en",
    event: "moveend",
    cssClass: "leaflet-control-weather",
    iconUrlTemplate: "https://openweathermap.org/img/w/:icon",
    template: '<div class="weatherIcon"><img src=":iconurl"></div><div>T: :temperature°F</div><div>H: :humidity%</div><div>W: :winddirection :windspeed m/s</div>',
    translateWindDirection: function(text) {
      return text;
    },
    updateWidget: undefined
  },
  onAdd: function(map) {
    this._div = L.DomUtil.create('div', this.options.cssClass);
    this.onMoveEnd = onMoveEnd.bind(this);
    if (!this.options.updateWidget) {
      this.options.updateWidget = this._updateWidget.bind(this);
    }
    this.refresh(this.options.updateWidget.bind(this));
    this._map.on(this.options.event, this.onMoveEnd);

    function onMoveEnd() {
      var _this = this;
      this.refresh(function(weather) {
        _this.options.updateWidget(weather);
      });
    }
    return this._div;
  },
  onRemove: function(map) {
    this._map.off(this.options.event, this.onMoveEnd);
  },
  refresh: function(callback) {
    var _this = this,
      center = this._map.getCenter(),
      url = "https://api.openweathermap.org/data/2.5/weather?lat=:lat&lon=:lng&lang=:lang&units=:units&appid=:appkey";
    var apiKey = this.options.apiKey;

    url = url.replace(":lang", this.options.lang);
    url = url.replace(":units", this.options.units);
    url = url.replace(":lat", center.lat);
    url = url.replace(":lng", center.lng);
    url = url.replace(":appkey", apiKey);
    $.getJSON(url, function(weather) {
      callback(weather);
    });
  },
  _updateWidget: function(weather) {
    var iconUrl = this.options.iconUrlTemplate.replace(":icon", weather.weather[0].icon + ".png");
    var tpl = this.options.template;
    tpl = tpl.replace(":iconurl", iconUrl);
    tpl = tpl.replace(":temperature", weather.main.temp);
    tpl = tpl.replace(":humidity", weather.main.humidity);
    tpl = tpl.replace(":windspeed", weather.wind.speed);
    tpl = tpl.replace(":winddirection", this.mapWindDirection(weather.wind.deg));
    tpl = tpl.replace(":windegrees", weather.wind.deg);
    this._div.innerHTML = tpl;
  },
  /**
   * Maps from wind direction in degrees to cardinal points
   * According to :
   * http://climate.umn.edu/snow_fence/components/winddirectionanddegreeswithouttable3.htm
   * Stupid reference.  Tables aren't the devil, and provide us with a 
   * much easier path forward for internationalization (translation)
   * _wind_dir_table = _wind_dir_table_[es|fr|ru|etc...];
   */
  // Example table for 16 compass points
  // _wind_dir_table: [
  //    "N", "NNE", "NE", "ENE", "E", "ESE", "SE",
  //    "SSE", "S", "SSW", "SW", "WSW", "W", 
  //    "WNW", "NW", "NNW", "N" ];
  // Table for 8 compass points
  _wind_dir_table: [ "N", "NE", "E", "SE", "S", "SW", "W", "NW", "N" ];

  mapWindDirection: function(degrees) {
    const divisor = 360 / wind_dir_table.length;
    let d = Math.Round(degrees/22.5) % (wind_dir_table.length);
    return _wind_dir_table[d];

    return this.options.translateWindDirection(text);
  }
});



L.control.weather = function(options) {
  if (!options.apiKey) {
    console.warn("Leaflet.Weather: You must provide an OpenWeather API key.\nPlease see https://openweathermap.org/faq#error401 for more info");
  }
  return new L.Control.Weather(options);
};
