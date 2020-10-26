const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

exports.mongoConnect = (callBack) => {
    MongoClient.connect('mongodb+srv://lalit:rXVxJia2GXCFQLSB@cluster0.keejz.mongodb.net/shop?retryWrites=true&w=majority')
    .then((client) => {
        console.log('connected');
        _db = client.db();
        callBack()
    })
    .catch(err => { 
        console.log(err);
        throw err;
    });
}
exports.getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!';
};