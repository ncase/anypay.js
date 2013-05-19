
// STEP 1) Initialize an Express app
var express = require('express');
var app = express();
app.use('/', express.static('./static'));
app.use(express.bodyParser());
var port = process.env.PORT || 80;
app.listen(port);
console.log('Express server started on port '+port);


// STEP 2) Require Anypay.js
require('./anypay/anypay')(app);


// STEP 3) Your other app logic
app.get("/",function(request,response){
	response.redirect("/buy");
});