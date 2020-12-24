const { authJwt } = require('../middleware')
const controller = require('../controllers/rewardifyController')
const cors = require('./cors')
module.exports = function (app) {
  app.use(cors.corsWithOptions, (req, res, next) => {
    // res.header(
    //   'Access-Control-Allow-Headers',
    //   'x-access-token, Origin, Content-Type, Accept, Options'
    // )
    next()
  })

  app.get(
    '/api/rewardify/user/:id',
    cors.cors,
    authJwt.verifyToken,
    controller.retrieveUser
  )
  app.put(
    '/api/rewardify/addCredit',
    cors.corsWithOptions,
    authJwt.verifyToken,
    authJwt.isAdmin,
    controller.addCredit
  )
  app.put(
    '/api/rewardify/subtractCredit',
    cors.corsWithOptions,
    authJwt.verifyToken,
    authJwt.isAdmin,
    controller.subtractCredit
  )
  app.put(
    '/api/rewardify/replaceCredit',
    cors.corsWithOptions,
    authJwt.verifyToken,
    authJwt.isAdmin,
    controller.replaceCredit
  )
}
