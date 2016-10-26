var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    app = express(),
    mongoUrl = 'mongodb://localhost:27017/textmonkey';

var access = require('./access.js');


MongoClient.connect(mongoUrl, function (err, db) 
{
    if (err) throw 'Error connecting to db - ' + err;

    app.post('/book', function (req, res) 
    {
        if (!req.body.title || !req.body.author) res.status(400).send("send title and author for book");
        else if (!req.body.text) res.status(400).send("send some text the book");
        else {
            access.saveBook(db, req.body.title, req.body.author, req.body.text, function (err) 
            {
                if (err) res.status(500).send("Server error");
                else res.status(201).send("Saved");
            });
        }
    });

    app.get('/book/:title', function (req, res) {
    if (!req.param('title')) res.status(400).send("send a title");
    else {
	        access.findBookByTitleCached(db, redis, req.param('title'), function (book) 
	        {
	            if (!text) res.status(500).send("Server error");
	            else res.status(200).send(book);
	        });
    	}
	});

    app.put('/book/:title', function (req, res) {
    if (!req.param("title")) res.status(400).send("send the book title");
    else if (!req.param("text")) res.status(400).send("send the new text");
    else {
	        access.updateBookByTitle(db, redis, req.param("title"), req.param("text"), function (err) 
	        {
	            if (err == "Missing book") res.status(404).send("Book not found");
	            else if (err) res.status(500).send("Server error");
	            else res.status(200).send("Updated");
	        });
    	}
	});

    app.listen(8080, function () {
        console.log('Listening on port 8080');
    });
});