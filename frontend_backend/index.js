const express = require('express');
const app = express();
const ServerTraffic = require('./routes/servertraffic');
const mongoose = require('mongoose');
const port = 3000;

mongoose.connect('mongodb://localhost:27017/test')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use(express.json());
app.use('/api', ServerTraffic); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
