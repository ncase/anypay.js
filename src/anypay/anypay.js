// Import Libraries
var Q = require('q');
var httpRequest = require('request');

// Init Mongo Database
var mongo = require('mongodb').MongoClient,
    mongoURI = process.env.MONGO_URI,
    ObjectID = require('mongodb').ObjectID;


/*******

ANYPAY.JS
Lets users pay what they want, however they want.

1) Payment & Completion pages
2) Logging transactions
3) Different payment methods

*******/
module.exports = function(app){


	// Various methods of payment
	require('./balanced')(app);
	require('./coinbase')(app);
	require('./paypal')(app);


	// Log transactions, with promise.
	app.logTransaction = function(transaction){

		/**
		Transaction:
		{
			item_id: ID of item
			amount: How much the user paid, in USD Dollars
			custom: JSON object of custom variables

			payment_method: What external payments service the user chose
			payment_data: Raw data from the payment service
		}
		**/

		var deferred = Q.defer();
		transaction._id = new ObjectID();

		mongo.connect(mongoURI,function(err,db){
			if(err){ return deferred.reject(err); }
			db.collection('transactions').insert(transaction,function(err){
	            if(err){ return deferred.reject(err); }
				deferred.resolve(transaction);
			});
		});

		return deferred.promise;

	}

	// Render page from transaction query
	app.renderTransaction = function(query,response){
		mongo.connect(mongoURI,function(err,db){
			if(err){ return response.send("error"); }
			db.collection('transactions').find(query).toArray(function(err,docs){
	            if(err){ return response.send("error"); }

	            var transaction = docs[0];
				
				// No Transaction
				if(!transaction){
					return response.send("No such transaction.");
				}

				// Render Transaction
				response.send("Thanks! <br> <pre>" + JSON.stringify(transaction,null,'\t') + "</pre>");

			});
		});
	};


	// Pay What You Want page
	app.get("/buy",function(request,response){
		response.render("anypay/buy.ejs",{
			environment:{
				PAYPAL_ACTION: process.env.PAYPAL_ACTION,
				PAYPAL_RECEIVER_EMAIL: process.env.PAYPAL_RECEIVER_EMAIL,
			}
		});
	});


	// A General Payment Complete Page	
	app.get("/paid",function(request,response){

		// Makes sure the query _id is valid
	    var _id = request.query.id;
	    var query = {};
	    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	    query._id = checkForHexRegExp.test(_id) ? new ObjectID(_id) : -1;

	    // Display the transaction
		app.renderTransaction(query, response);

	});

};