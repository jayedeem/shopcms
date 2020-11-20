const express = require('express');
const morgan = require('morgan');
const app = express();
const shopRoute = require('./routes/shopRoutes');
const dashboardRoute = require('./routes/dashboard');
const rewardifyRoute = require('./routes/rewardifyRoutes');
require('dotenv').config();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
morgan('tiny');

app.use('/', shopRoute);
app.use('/', dashboardRoute);
app.use('/', rewardifyRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
