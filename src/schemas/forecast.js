const Joi = require('joi');

export const hourly_schema = () => {
    return {
        time: Joi.date().iso().required(),
        forecast: Joi.string().allow(''),
        short_forecast: Joi.string().allow(''),
        temperature: Joi.number().required(),
        feels_like: Joi.number().required(),
        precip_probability: Joi.number().required(),
        relative_humidity: Joi.number().required(),
        dew_point: Joi.number().precision(2).required(),
        wind_speed: Joi.number().precision(2).required(),
        wind_chill: Joi.number().precision(2).required(),
        wind_direction: Joi.string(),
    }
}

export const forecast_schema = Joi.object({
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
    provider: Joi.string().required(),
    provider_specific: Joi.object(),
    units: Joi.object({
        temperature: Joi.string(),
        feels_like: Joi.string(),
        precip_probability: Joi.string(),
        relative_humidity: Joi.string(),
        dew_point: Joi.string(),
        wind_speed: Joi.string(),
        wind_chill: Joi.string()
    }),
    currently: Joi.object({...hourly_schema()}),
    daily: Joi.array().items(Joi.object()),
    hourly: Joi.array().items(Joi.object({...hourly_schema()})),
})