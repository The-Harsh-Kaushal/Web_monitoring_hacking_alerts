const  express = require('express')
const mongoose = require('mongoose')
const sessionTracker = require('./middlewares/UserCount');
const trackUser = require('./middlewares/trackUser');
const geoTracker = require('./middlewares/GeoLocation');
const checkThreat= require('./middlewares/checkThreat');

const app = express()
const port = 3000
app.use(express.json());
app.use(sessionTracker);
app.use(trackUser);
app.use(geoTracker);
app.use(checkThreat);


mongoose.connect('mongodb://localhost:27017/test')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))


  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.listen(port, () => console.log(`Example app listening on port ${port}!`))