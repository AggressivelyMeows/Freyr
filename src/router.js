import { geocode } from './geocoding.js'
import { Stopwatch } from 'cfw-easy-utils'
import { forecast_schema } from './schemas/forecast.js'

// import providers
import NWSProvider from './providers/nws.js'

const Router = require('@tsndr/cloudflare-worker-router')
const router = new Router()

const providers = [
    new NWSProvider()
]

router.cors()

router.get('/v1/forecast', async (req, res) => {
    // get geolocation for the query
    const target = req.query.q

    const geocoded_location = await geocode(target)

    const provider = providers.find(x => x.country_codes.includes(geocoded_location.address.country_code))

    if (!provider) {
        res.status = 400
        res.body = {
            success: false,
            error: 'This address is for a location we do not currently support.'
        }
        return
    }

    const options = {
        limit: 48,
        units: 'si',
        stopwatch: new Stopwatch()
    }

    Object.assign(options, req.query)

    let weather = await provider.get_weather(geocoded_location.lat, geocoded_location.lon, options)

    if (weather.success) {
        const validate = forecast_schema.validate(weather.forecast)

        if (validate.error) {
            res.status = 500
            res.body = {
                success: false,
                error: 'There was a schema validation error during the processing of this request, Please contact the developers.'
            }
        } else {
            res.body = {
                success: true,
                forecast: weather.forecast,
                meta: options.stopwatch.checkpoints
            }
        }
    } else {
        // we got an error
        res.status = weather.status
        res.body = {
            success: false,
            message: weather.message,
            error: weather.error
        }
    }

    return
})

export default router
