'use strict';

const express = require('express');
const morgan = require('morgan');

const mongoose = require('mongoose');
// Mongoose internally uses a promise-like object,
// but it's better to make Mongoose use built in es6 promises
mongoose.promise = global.Promise;

const app = express();

//const blogRouter = require('./blogRouter');
// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

//app.use(express.static('public'));  // ????
app.use(express.json()); // ????
app.use(morgan('common'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//app.use('/blog-posts', blogRouter);

app.get('/blog-posts', (req, res) => {
  BlogPost
  .find()
  .then(posts => {
    res.json({
      posts.map((post) => post.serialize())
    });
  })
  .catch(
    err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/blog-posts/:id', (req, res) => {
  BlogPost
  .findById(req.params.id)
  .then(posts => res.json(posts.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'})
  });
});

app.post('/blog-posts', (req, res) => {
  const requiredFields = ['title', 'author', 'content'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
    BlogPost
    .create({
      title: req.body.name,
      author: req.body.author,
      content: req.body.content
    })
    .then(
      posts => res.status(201).json(posts.serialize())
    )
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.put('/blog-posts/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id(${req.params.id}) and request body id` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updatableFields = ['title', 'author', 'content'];
  updatableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPost
  .findByIdAndUpdate(req.params.id, {$set: toUpdate})
  .then(posts => res.status(204).end())
  .catch(err => res.status(500)/json({message: 'Internal server error'}));
});

app.delete('/blog-posts/:id', (req, res) => {
  BlogPost
  .findByIdAndRemove(req.params.id)
  .then(() => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
});

let server;
/*
function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}*/

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log('Your app is listening on port ${port}');
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
