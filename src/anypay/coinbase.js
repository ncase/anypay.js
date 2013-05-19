// Import Libraries
var Q = require('q');
var httpRequest = require('request');

// Environment Variables
var COINBASE_API_KEY = process.env.COINBASE_API_KEY;
var COINBASE_SECRET = process.env.COINBASE_SECRET;


/*******

Coinbase - a bitcoin payment service
https://coinbase.com/

*******/
module.exports = function(app){


	// Create a payment form, then immediately redirect to it.
	app.post('/pay/coinbase',function(request,response){

		httpRequest.post({
			
			url: "https://coinbase.com/api/v1/buttons",
			json: {
				"api_key": COINBASE_API_KEY,
				"button": {
			        "name": "The Open Bundle",
			        "price_string": request.body.amount,
			        "price_currency_iso": "USD",
			        "custom": JSON.stringify(request.body),
			        "description": "Sample description",
			        "type": "buy_now",
			        "style": "custom_large"
			    }
			}

		}, function(err,res,body){
			
			if(err || !body.success){
				return response.send("error!");
			}

			var newButton = body.button;
			response.redirect("https://coinbase.com/checkouts/"+newButton.code);

		});

	});


	// Instant Payments Notification Callback
	app.post("/pay/coinbase/ipn",function(request,response){

		if(request.query.secret!=COINBASE_SECRET){
			response.send("Wrong secret key.");
			return;
		}

		// Parse metadata, which was hidden in Custom.
		var transaction = request.body.order;
		var metadata = JSON.parse(transaction.custom);

		// Log Transaction
		app.logTransaction({

			item_id: metadata.item_id,
			amount: (transaction.total_native.cents/100), // Convert to USD
			custom: metadata.custom,

			payment_method: "coinbase",
			payment_data: transaction

		}).then(function(){
			response.send("Transaction logged!");
		});	

	});


	// When payment complete, show Payment Success page.
	app.get("/pay/coinbase/success",function(request,response){
		app.renderTransaction({ "payment_data.id": request.query.order.id },response);
	});

};