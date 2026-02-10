// Netlify Function: CDP API Proxy
// Proxies requests to SAP CDP API to avoid CORS issues and keep credentials server-side

const CDP_BASE_URL = 'https://cdp.EU5-prod.gigya.com/api/businessunits/4_GJZtcJvXbmKrbEyYcnj4DQ'

const CUSTOMER_VIEW_PATH = '/views/HJolf9MBIvH7oEBmM3UpOw/customers'
const BIKE_SCHEMA_PATH = '/schemas/HKpZLWYkvpRykUOwL4YiCw/groups'

export default async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.json()
    const { action, email, bikeId } = body

    let cdpUrl
    let params

    if (action === 'customer' && email) {
      const query = `select * from profile WHERE attributes.primaryEmail = '${email}' LIMIT 10`
      params = new URLSearchParams({
        purposeIds: process.env.CDP_CUSTOMER_PURPOSE_IDS,
        userKey: process.env.CDP_CUSTOMER_USER_KEY,
        secret: process.env.CDP_CUSTOMER_SECRET,
        query
      })
      cdpUrl = `${CDP_BASE_URL}${CUSTOMER_VIEW_PATH}?${params}`

    } else if (action === 'bike' && bikeId) {
      const query = `select * from groups WHERE attributes.accountID = "${bikeId}"`
      params = new URLSearchParams({
        query,
        userKey: process.env.CDP_BIKE_USER_KEY,
        secret: process.env.CDP_BIKE_SECRET
      })
      cdpUrl = `${CDP_BASE_URL}${BIKE_SCHEMA_PATH}?${params}`

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action or missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const cdpResponse = await fetch(cdpUrl)
    const data = await cdpResponse.json()

    return new Response(JSON.stringify(data), {
      status: cdpResponse.status,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('[cdp-proxy] Error:', err)
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
