var aws  = require('aws-sdk');
var async = require('async');
var nexmo = require('easynexmo');

var EVENT_SOURCE_TO_TRACK = /sns.amazonaws.com/;  
var EVENT_NAME_TO_TRACK   = /CreateTopic/; 
var DEFAULT_SNS_REGION  = 'us-east-1';
var SNS_TOPIC_ARN       = 'arn:aws:sns:us-east-1:SNSTOPIC'; // replace this with actual SNS

var sns = new aws.SNS({
    apiVersion: '2010-03-31',
    region: DEFAULT_SNS_REGION
});

nexmo.initialize("API_KEY","API_SECRET","https",true);

function consolelog (err,messageResponse) {
	if (err) {
                console.log(err);
        } else {
                console.dir(messageResponse);
        }
}
/*
Event object structure :

{
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:EXAMPLE",
      "Sns": {
        "Type": "Notification",
        "MessageId": "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
        "TopicArn": "arn:aws:sns:EXAMPLE",
        "Subject": "TestInvoke",
        "Message": "Hello from SNS!",
        "Timestamp": "1970-01-01T00:00:00.000Z",
        "SignatureVersion": "1",
        "Signature": "EXAMPLE",
        "SigningCertUrl": "EXAMPLE",
        "UnsubscribeUrl": "EXAMPLE",
        "MessageAttributes": {
          "Test": {
            "Type": "String",
            "Value": "TestString"
          },
          "TestBinary": {
            "Type": "Binary",
            "Value": "TestBinary"
          }
        }
      }
    }
  ]
}

*/
exports.handler = function(event, context) {
    
    async.waterfall([
		function logEvent(next) {
			//console.dir(event);
			next();
		},
		function processEvent(next) {
			//add custom processing logic
			next();
		},
		function sendNexmoMessage(next) {
			try {
				var smsMessage=JSON.parse(event.Records[0].Sns.Message);
				nexmo.sendMessage(
					smsMessage,function(err,messageResponse) {
						//add custom logic to handle success or failed message delivery 
						consolelog(err,messageResponse);
						next(err);
					}
				);
			} catch (err) {
				next(err);
			}
		}
    ], function (err) {
        if (err) {
            console.error('Failed to publish notifications: ', err);
        } else {
            console.log('Successfully published all notifications.');
        }
        context.done(err);
    });
};
function testSNSDelivery() {
	var message = { from:NEXMO_FROM_NUMBER,
				  to:TO_NUMBER,
				  text:'testing from local to sns to lambda to nexmo'
				};
	var params = {
	    TargetArn:SNS_TOPIC_ARN,
	    Message:JSON.stringify(message),
	    Subject: 'TestSNSNexmo'
	};

	sns.publish(params, function(err,data){
	        if (err) {
	            console.log('Error sending a message', err);
	        } else {
	            console.log('Sent message:', data.MessageId);
	        }
	    });
}

//testSNSDelivery();