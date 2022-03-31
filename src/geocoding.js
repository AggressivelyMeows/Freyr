import router from './router.js'

export const geocode = async (search) => {
    const cached_data = await GEOCODING_CACHE.get(search)

    if (cached_data) {
        console.log(`[GEOCODE] Loaded "${search}" from cache`)
        return JSON.parse(cached_data)
    }

    const location_data = (await fetch(`https://us1.locationiq.com/v1/search.php?key=${globalThis.GEOCODE_API_KEY}&format=json&addressdetails=1&q=${search}`).then(resp => resp.json()))[0]

    await GEOCODING_CACHE.put(search, JSON.stringify(location_data))
    
    return location_data
}