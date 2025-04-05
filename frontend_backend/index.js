const express = require('express');
const app = express();
const ServerTraffic = require('./routes/servertraffic');
const pagevisited = require('./routes/pagevisited');
const sessionduration = require('./routes/sessionduration');
const geolocation = require('./routes/geolocation');
const mongoose = require('mongoose');
const cors = require("cors");
const port = 3000;

mongoose.connect('mongodb://localhost:27017/test')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use(express.json());
app.use('/api', ServerTraffic); 
app.use('/api', pagevisited);
app.use('/api', sessionduration);
app.use('/api', geolocation);
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
