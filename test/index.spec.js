import test from "ava";
import { Miniflare } from "miniflare";

import { forecast_schema } from '../src/schemas/forecast.js'
import { providers } from '../src/providers/all.js'

test.before((t) => {
  // Create a new Miniflare environment for each test
  const mf = new Miniflare({
        // Autoload configuration from `.env`, `package.json` and `wrangler.toml`
        envPath: true,
        packagePath: true,
        wranglerConfigPath: true,
        // We don't want to rebuild our worker for each test, we're already doing
        // it once before we run all tests in package.json, so disable it here.
        // This will override the option in wrangler.toml.
        buildCommand: undefined,
    })

    t.context = { mf }
})

for (const provider of providers) {
    test(`Provider ${provider.provider_id} follows valid forecast schema`, async (t) => {
        // Get the Miniflare instance
        const { mf } = t.context;

        // Test if the forecast is a valid forecast object.
        const res = await mf.dispatchFetch(`http://localhost:8787/v1/forecast?q=${provider.test_cases.valid}`)
        const data = await res.json()

        t.false(
            'error' in forecast_schema.validate(data.forecast),
        )
    })

    test(`Provider ${provider.provider_id} handles data error`, async (t) => {
        // Get the Miniflare instance
        const { mf } = t.context;

        // Force the API to return a bad response
        const res = await mf.dispatchFetch(`http://localhost:8787/v1/forecast?q=${provider.test_cases.valid}&force_error=1`)
        const data = await res.json()

        t.true(
            'error' in data,
        )
    })
}