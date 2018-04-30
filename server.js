const express = require('express');
const morgan = require('morgan');

const app = express();

const blogRouter = require('./blogRouter');

//app.use(express.static('public'));
app.use(morgan('common'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.use('/blog-posts', blogRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});