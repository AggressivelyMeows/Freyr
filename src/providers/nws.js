import moment from 'moment'
import { convert_units, conversion_units } from './utils.js'

export default class NWSProvider {
    constructor() {
        this.provider_id = 'NWS'
        this.country_codes = ['us'] // this provider  is for the United States
        this.fetch_options = {headers: {'User-Agent': '(Freyr, contact@ceru.dev)'}}
        this.units = {}

        // test cases
        this.test_cases = {
            valid: 'Austin, TX',
            invalid: 'London'
        }
    }

    unpack_raw(hour, raw_values, time, units) {
        const ret = raw_values.values.find(x => {
            const before = new Date(x.validTime.split('/')[0])
            const d = moment.duration(x.validTime.split('/')[1])
            const after = new Date(before.valueOf() + d.asMilliseconds())
            return before <= time && after >= time
        }) || { value: 0 }

        var fixed = ret.value

        if (!Number.isInteger(fixed) && fixed) {
            fixed = parseFloat(fixed.toFixed(2))
        }

        return fixed || 0
    }

    get_raw_unit(raw_values) {
        return (raw_values?.uom || '').split(':')[1].replace('deg', '°').replace('_', '/').split('-')[0]
    }

    set_units(key, value) {
        this.units[key] = value
    }

    normalize_hourly(hour, raw, units) {
        const output = {}

        output.time = new Date(hour.startTime).toISOString()

        output.forecast = hour.detailedForecast
        output.short_forecast = hour.shortForecast

        const add = (key, target) => {
            let unit = this.get_raw_unit(raw.properties[key])
            let value = this.unpack_raw(
                hour,
                raw.properties[key],
                new Date(hour.startTime),
                units
            )

            if (unit.includes('°')) {
                if (units == 'si' && unit != '°C') {
                    value = convert_units('F', 'C', value)
                    unit = '°C'
                }
                if (units == 'us' && unit != '°F') {
                    value = convert_units('C', 'F', value)
                    unit = '°F'
                }
            }

            output[target || key] = value

            this.set_units(target || key, unit)
            //output[(target || key) + '_unit'] = unit
        }

        const keys = [
            ['temperature'],
            ['apparentTemperature', 'feels_like'],
            ['probabilityOfPrecipitation', 'precip_probability'],
            ['relativeHumidity', 'relative_humidity'],
            ['dewpoint', 'dew_point'],
            ['windSpeed', 'wind_speed'],
            ['windChill', 'wind_chill'],
        ].forEach(x => add(x[0], x[1]))

        output.wind_direction = hour.windDirection
        return output
    }

    normalize_daily(day, raw, units) {
        return {
            time: new Date(day.startTime).toISOString(),
            temperature: convert_units(day.temperatureUnit, conversion_units[units].temp, day.temperature),
            temperature_unit: '°' + conversion_units[units].temp,
            temperature_trend: day.temperatureTrend,
            wind_speed: day.windSpeed,
            wind_direction: day.wind_direction,
            short_forecast: day.shortForecast,
            forecast: day.detailedForecast
        }
    }

    async get_weather(lat, lon, options) {
        options.stopwatch.mark(`Requested location is in "United States"`)

        // first convert lat, lon into the weather station
        const nearest_weather_station = await fetch(`https://api.weather.gov/points/${lat},${lon}`, this.fetch_options).then(resp => resp.json())
        options.stopwatch.mark(`Found nearest weather station (${nearest_weather_station.properties.radarStation})`)

        const forecast = await fetch(options.force_error ? 'https://api.weather.gov/gridpoints/TOP/31,0/forecast' : nearest_weather_station.properties.forecast, this.fetch_options).then(resp => resp.json())
        const hourly_raw = await fetch(nearest_weather_station.properties.forecastHourly, this.fetch_options).then(resp => resp.json())
        const raw = await fetch(nearest_weather_station.properties.forecastGridData, this.fetch_options).then(resp => resp.json())

        options.stopwatch.mark('Fetched weather data from API')

        if ('status' in forecast || 'status' in hourly_raw || 'status' in raw) {
            return {
                success: false,
                message: 'upstream NWS source returned an error',
                status: forecast.status,
                error: forecast
            }
        }
        
        // merge raw into hourly to provide rain chance and warnings
        const hourly = hourly_raw.properties.periods.slice(0, options.limit_hours || options.limit).map(x => this.normalize_hourly(x, raw, options.units))
        const daily = forecast.properties.periods.map(x => this.normalize_daily(x, raw, options.units))

        options.stopwatch.mark('Finishing')

        return {
            success: true,
            forecast: {
                latitude: lat,
                longitude: lon,
                provider: this.provider_id,
                provider_specific: {
                    radar_image: `https://radar.weather.gov/ridge/lite/${nearest_weather_station.properties.radarStation}_0.gif`,
                },
                units: this.units,
                currently: hourly[0],
                daily,
                hourly
            }
        }
    }
}