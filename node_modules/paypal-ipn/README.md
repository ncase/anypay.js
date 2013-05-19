# Paypal IPN Verification

A simple NodeJS package for verifying Paypal IPN messages.

## Installation
`npm install paypal-ipn`

## Usage
There is only one function, `verify`, which is used to verify any IPN messages you receive:

    ipn.verify(ipn_params, callback);

`ipn_params` is the dictionary of POST values sent to your IPN script by Paypal. Don't modify the dict in any way, just pass it directly to `ipn.verify` to check if the IPN message is valid.


Example code:

    var ipn = require('paypal-ipn');

    ipn.verify(params, function callback(err, msg) {
      if (err) {
        console.error(msg);
      } else {
        //Do stuff with original params here

        if (params.payment_status == 'Completed') {
          //Payment has been confirmed as completed
        }
      }
    });

Note that all the package does is confirm that the IPN message is valid. After this, you will still need to make some more checks:

> Confirm that the payment status is Completed.

> Use the transaction ID to verify that the transaction has not already been processed, which prevents duplicate transactions from being processed.

> Validate that the receivers email address is registered to you.

> Verify that the price, item description, and so on, match the transaction on your website.

You can find more information on the [Paypal documentation for IPN](https://cms.paypal.com/cgi-bin/marketingweb?cmd=_render-content&content_ID=developer/e_howto_admin_IPNIntro).

### The callback
The callback has two parameters, `err` and `msg`.

`err` will be set to true if the IPN was invalid or the request could not be made. If it is false, then the IPN was valid and you can continue to process the payment.

If `err` was set to true, you can check `msg` for the exact error message.

If `err` was false, then `msg` will always be `VERIFIED`.

### ExpressJS
`paypal-ipn` works fine with [ExpressJS](http://expressjs.com/) or any other web framework.

All you need to do is pass in the request parameters to `ipn.verify`.

In ExpressJS, the request parameters are in `req.body`:

    ipn.verify(req.body, callback_function);
