const mongoose = require('mongoose');

//this is the schema to represent blog posts
const blogPostsSchema = mongoose.Schema({
	title: {type: String, required: true},
	author: {
		firstName: String,
		lastName: String
	},
	content: {type: String, required: true},
	created: {type: Date, default: Date.now}
});

blogPostsSchema.virtual('authorString').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostsSchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		author: this.authorString,
		content: this.content,
		created: this.created
	};
}