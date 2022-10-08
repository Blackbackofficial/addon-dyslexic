const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');

app.locals.dateFns = require('date-fns');

app.get('/', (req, res) => {
  res.render('home', {
    title: 'Dyslexic',
  });
});

app.get('/hi', (req, res) => {
  res.render('hi', {
    title: 'About dyslexic',
  });
});

app.use(function (err, req, res, next) {
  console.error(err);
  res.set('Content-Type', 'text/html');
  res.status(500).send('<h1>Internal Server Error</h1>');
});

const server = app.listen(process.env.PORT || 3456, () => {
  console.log(`Hacker news server started on port: ${server.address().port}`);
});
