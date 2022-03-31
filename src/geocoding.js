import router from './router.js'

export const geocode = async (search) => {
    const cached_data = await GEOCODING_CACHE.get(search)

    if (cached_data) {
        console.log(`[GEOCODE] Loaded "${search}" from cache`)
        return JSON.parse(cached_data)
    }

    const start = new Date()
    const location_data = (await fetch(`https://us1.locationiq.com/v1/search.php?key=${globalThis.GEOCODE_API_KEY}&format=json&addressdetails=1&q=${search}`).then(resp => resp.json()))[0]

    const record = async () => {
        // wrap for debug
        await fetch(
            `https://api.constellations.tech/v2/freyr-geocoding?value=${new Date().getTime() - start.getTime()}&log=Searching%20for%20${search}`,
            { headers: { 'Authorization': `${globalThis.CONSTELLATIONS_GEOCODING_KEY}` } }
        )
    }

    globalThis.event.waitUntil(
        record()
    )

    await GEOCODING_CACHE.put(search, JSON.stringify(location_data))
    
    return location_data
}