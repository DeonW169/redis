module.exports.saveBook = function (db, title, author, text, callback) 
{
    db.collection('text').save({
        title: title,
        author: author,
        text: text
    }, callback);
};

module.exports.findBookByTitleCached = function (db, redis, title, callback) 
{
    redis.get(title, function (err, reply) 
    {
        if (err) callback(null);
        else if (reply) //Book is in the cache
        callback(JSON.parse(reply));
        else {
            //Book is not in cache - get from db
            db.collection('text').findOne({
                title: title
            }, function (err, doc) 
            {
                if (err || !doc) callback(null);
                else {\\Book found in database, save to cache and
                    return to client
                    redis.set(title, JSON.stringify(doc), function () {
                        callback(doc);
                    });
                }
            });
        }
    });
};

module.exports.access.updateBookByTitle = function (db, redis, title, newText, callback) 
{
    db.collection("text").findAndModify({
        title: title
    }, {
        $set: {
            text: text
        }
    }, function (err, doc) 
    { //Update db
        if (err) callback(err);
        else if (!doc) callback('Missing book');
        else {
            //Save to cache
            redis.set(title, JSON.stringify(doc), function (err) 
            {
                if (err) callback(err);
                else callback(null);
            });
        }
    });
};