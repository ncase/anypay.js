// Import Libraries
var Q = require('q');
var httpRequest = require('request');

// Environment Variables
var BALANCED_MARKETPLACE_URI = process.env.BALANCED_MARKETPLACE_URI;
var BALANCED_API_KEY = process.env.BALANCED_API_KEY;


/*******

Balanced Payments - white-label credit card & bank account processing
http://balancedpayments.com

*******/
module.exports = function(app){

	// Render the modal overlay
	app.get("/pay/balanced",function(request,response){
		response.render("anypay/balanced.ejs",{
			marketplace_uri: BALANCED_MARKETPLACE_URI
		});
	});

	// Charge a card and log the transaction
	app.post("/pay/balanced",function(request,response){
		
		Q.fcall(function(){

			// Create card
			return callBalanced("accounts",{
				card_uri: request.body.card_uri
			});

		}).then(function(account){

			// Charge card
			return callBalanced("debits",{
				account_uri: account.uri,
				amount: Math.round(request.body.amount*100) // Holy shit, make sure this does NOT fuck up. Converting to USD cents.
			});

		}).then(function(chargeData){

			// Log transaction with Custom Vars
			return app.logTransaction({

				item_id: request.body.item_id,
				amount: (chargeData.amount/100), // Holy shit, make sure this does NOT fuck up. Converting to USD dollars
				custom: request.body.custom,

				payment_method: "balanced",
				payment_data: chargeData

			});

		}).then(function(transaction){
			
			console.log(transaction);
			response.send(transaction);

		},function(err){

			console.log(err);
			response.end();

		});

	});

};

// Helper method: Make a Balanced API call, with promise.
function callBalanced(url,json){

	var deferred = Q.defer();

	var balancedURI = "https://api.balancedpayments.com"+BALANCED_MARKETPLACE_URI+"/";
	var apiKey = BALANCED_API_KEY;

	httpRequest.post({
		
		url: balancedURI+url,
		auth: {
			user: apiKey,
			pass: "",
			sendImmediately: true
		},
		json: json

	}, function(error,response,body){

		if(error || response.status_code==400 ){ // Bad Request
			return deferred.reject(new Error());
		}

		deferred.resolve(body);

	});

	return deferred.promise;

}
