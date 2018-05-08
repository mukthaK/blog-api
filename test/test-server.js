const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Blog Posts', function() {
	// Before our tests run, we activate the server.
	before(function() {
    	return runServer();
  	});
	// close our server at the end of these tests.
	after(function() {
    	return closeServer();
  	});

	// test strategy:
	// make request to `/blog-posts`
	it('should list items on GET', function() {
	    return chai.request(app)
	      .get('/blog-posts')
	      .then(function(res) {
	        expect(res).to.have.status(200);
	        expect(res).to.be.json;
	        expect(res.body).to.be.a('array');

	        // because we create two items on app load
	        expect(res.body.length).to.be.at.least(1);
	      
	        const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
	        res.body.forEach(function(item) {
	          expect(item).to.be.a('object');
	          expect(item).to.include.keys(expectedKeys);
	        });
	      });
  	});

	//  1. make a POST request with data for a new item
  	//  2. inspect response object and prove it has right
  	//  status code and that the returned object has an `id`
  	it('should add an item on POST', function() {
    const newItem = {
    	title: 'Avengers: Infinity War', 
    	content: 'The Avengers battled their way to global box office domination this weekend', 
    	author: 'Frank Pallotta'
    };
    return chai.request(app)
      .post('/blog-posts')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
        expect(res.body.id).to.not.equal(null);
        // response should be deep equal to `newItem` from above if we assign
        // `id` to it from `res.body.id`
        expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  	});
  	
  	// Update item using PUT
  	it('should update items on PUT', function() {
    // we initialize our updateData here and then after the initial
    // request to the app, we update it with an `id` property so
    // we can make a second, PUT call to the app.
    const updateData = {
      title: 'Avengers: Infinity War',
      content: 'The Avengers battled their way to global box office domination this weekend', 
      author: 'Frank Pallotta'
    };

    return chai.request(app)
      // first have to get so we have an idea of object to update
      .get('/blog-posts')
      .then(function(res) {
        updateData.id = res.body[0].id;
        // this will return a promise whose value will be the response
        // object, which we can inspect in the next `then` block. Note
        // that we could have used a nested callback here instead of
        // returning a promise and chaining with `then`, but we find
        // this approach cleaner and easier to read and reason about.
        return chai.request(app)
          .put(`/blog-posts/${updateData.id}`)
          .send(updateData);
      })
      // prove that the PUT request has right status code
      // and returns updated item
      .then(function(res) {
        expect(res).to.have.status(204);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.deep.equal(updateData);
      });
  	});

  	// DELETE an item and ensure we get back a status 204
  	it('should delete items on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});