const axios = require('axios')
const redisClient = require('../db/redis')

const Shopify = require('shopify-api-node')
const sToken = Buffer.from(
  `${process.env.SHOPIFY_KEY}:${process.env.SHOPIFY_PASSWORD}`,
  'utf8'
).toString('base64')

// Create User

/*
POST /admin/api/2020-10/customers.json
{
  "customer": {
    "first_name": "Steve",
    "last_name": "Lastnameson",
    "email": "steve.lastnameson@example.com",
    "phone": "+15142546011",
    "verified_email": true,
    "send_email_invite": true,
    "tags": "employee"
    "addresses": [
      {
        "address1": "123 Oak St",
        "city": "Ottawa",
        "province": "ON",
        "phone": "555-1212",
        "zip": "123 ABC",
        "last_name": "Lastnameson",
        "first_name": "Mother",
        "country": "CA"
      }
    ]
  }
}
{
  "customer": {
    "email": null,
    "first_name": null,
    "last_name": null
  }
}

*/
exports.retrieveUsers = async (req, res, next) => {
  try {
    const cacheData = await redisClient.get('users')

    res.json({
      api: JSON.parse(cacheData),
      status: {
        msg: 'Fetching users'
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send(err.code)
  }
}

exports.resetUsers = (req, res, next) => {
  ;(async () => {
    const shopify = new Shopify({
      shopName: 'ultra-swag.myshopify.com',
      apiKey: process.env.SHOPIFY_KEY,
      password: process.env.SHOPIFY_PASSWORD,
      autoLimit: false
    })
    let params = { limit: 250 }
    let results = []

    do {
      const customers = await shopify.customer.list(params)
      results.push(customers)
      console.log(customers.length)
      params = customers.nextPageParameters
    } while (params !== undefined)
    const userApi = results.flat(1)

    // cacheData = {
    //   userApi
    // }
    // cacheTime = Date.now()
    // cacheData.cacheTime = cacheTime
    // const userData = JSON.stringify(cacheData)

    // await redisClient.set('users', userData, 'ex', 3600)
    // console.log('reset complete')
    return res.status(200).json({
      status: {
        msg: 'Completed',
        userApi
      }
    })
  })().catch((err) => console.err(err))
}
exports.createUser = async (req, res, next) => {
  const { email, first_name, last_name } = req.body
  console.log('creation', email, first_name, last_name)
  try {
    const { data } = await axios.request({
      url: `https://ultra-swag.myshopify.com/admin/api/2020-10/customers.json`,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        authorization: 'Basic ' + sToken
      },
      data: {
        customer: {
          first_name,
          last_name,
          email,
          verified_email: true,
          tags: 'employee',
          tax_exempt: true,
          addresses: [
            {
              address1: '1550 Scenic Ave, Ste 100',
              city: 'Costa Mesa',
              province: 'CA',
              zip: '92692',
              country: 'US'
            }
          ]
        }
      }
    })
    if (!data) {
      return res.json({
        status: {
          msg: 'Something went wrong'
        }
      })
    } else {
      return res.json({
        status: {
          msg: 'User Created',
          data
        }
      })
    }
  } catch (error) {
    console.log('error status', error.response.status)
    if (error.response.status === 422) {
      return res.json({
        status: {
          msg: 'User Already Created'
        }
      })
    }
  }
}

// Read User

/**
 * GET /admin/api/2020-10/customers/207119551.json
 */

// Update User
/**
 * PUT /admin/api/2020-10/customers/207119551.json
{
  "customer": {
    "id": 207119551,
    "email": "changed@email.address.com",
    "note": "Customer is a great guy"
  }
}

 */
// Delete A user

/**
 * There is no disable user in API
 * DELETE /admin/api/2020-10/customers/207119551.json
 */
exports.disableUser = async (req, res, next) => {
  const { id } = req.body
  try {
    const { data } = await axios.request({
      url: `https://ultra-swag.myshopify.com/admin/api/2020-10/customers/${id}.json`,
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        authorization: 'Basic ' + sToken
      }
    })
    console.log(data)
    res.json(data)
  } catch (error) {
    console.log(error)
  }
}
exports.reports = async (req, res, next) => {
  try {
    const reports = await axios.request({
      url: `https://ultra-swag.myshopify.com/admin/api/2020-10/reports.json`,
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        authorization: 'Basic ' + sToken
      }
    })
    console.log(reports)
  } catch (error) {
    console.log(error)
  }
}
