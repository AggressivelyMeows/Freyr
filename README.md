# Freyr - The weather API, on the edge

> Freyr, in Norse mythology, the ruler of peace and fertility, rain, and sunshine and the son of the sea god Njörd.
> Thor was taken 😔

The idea of this API is to provide a nice and simple interface for the worlds weather offices. The API will never pull from already aggregated sources to allow developers to use the data. This does mean the API needs providers for every country / region it wants to support so if you wish to add your own countries weather office, feel free to make a pull request!

## Why?
The original idea behind the API was to try and recreate the magic behind DarkSky. Since their acquisition and shut down of the API, theres been no real cheap access to weather data. That is what we aim to solve here. By creating an API that gets weather data directly from the source, then normalizing it into a universal format, you can get weather information for anywhere in the world*

The API is backed by Cloudflare's awesome Worker system that allows us to scale infinitely, so long as we dont overwhelm the providers.

### Currently supported countries
Due to how the API fetches weather data, we can only support countries where we have providers. Want us to support your country / region? Make a pull request and link your local weather office to Freyr!

- United States (National Weather Service)