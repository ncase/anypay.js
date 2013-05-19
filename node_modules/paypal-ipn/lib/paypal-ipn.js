var https = require('https');
var qs = require('querystring');

var SANDBOX_URL = 'www.sandbox.paypal.com';
var REGULAR_URL = 'www.paypal.com';


exports.verify = function verify(params, callback) {
  if (typeof params === "undefined") {
    return callback(true, 'No params were passed to ipn.verify');
  }

  params.cmd = '_notify-validate';

  var body = qs.stringify(params);

  //Set up the request to paypal
  var req_options = {
    host: (params.test_ipn) ? SANDBOX_URL : REGULAR_URL,
    method: 'POST',
    path: '/cgi-bin/webscr',
    headers: {'Content-Length': body.length}
  }


  var req = https.request(req_options, function paypal_request(res) {
    res.on('data', function paypal_response(d) {
      var response = d.toString();

      //Check if IPN is valid
      callback(response != 'VERIFIED', response);
    });
  });

  //Add the post parameters to the request body
  req.write(body);

  req.end();

  //Request error
  req.on('error', function request_error(e) {
    callback(true, e);
  });
};
