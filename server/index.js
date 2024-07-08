require('dotenv').config();
const express = require('express');
const cors = require('cors');
const controller = require('./controllers.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/test', (req, res) => {
  res.json('hello');
});

app.get('/reviews/', (req, res) => {
  controller.getReviews(req, res);
});
app.get('/reviews/meta/', (req, res) => {
  controller.getMetaData(req, res);
});
app.post('/reviews/', (req, res) => {
  controller.addReview(req, res);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));