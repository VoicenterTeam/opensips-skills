## 1.5.�Examples

### 1.5.1.�Event-Driven Messaging with _Event Interface_

OpenSIPS' event interface can be utilized to send messages to SQS by subscribing to an event and raising it when needed.

Steps:

*   _Event Subscription:_
    
    First, register the event subscription in your OpenSIPS configuration file within the \`startup\_route\`:
    
    subscribe\_event("MY\_EVENT",
    	"sqs:http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/Queue2");
    		
    
*   _Event Subscription via CLI:_
    
    After starting OpenSIPS, you can subscribe to the event from another terminal using the OpenSIPS CLI:
    
    opensips-cli -x mi event\_subscribe MY\_EVENT \\
    	  sqs:http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/Queue2
    		
    
*   _Raise the Event and Send Message:_
    
    Finally, to send a message, raise the subscribed event with the desired message content:
    
    opensips-cli -x mi raise\_event MY\_EVENT 'OpenSIPS Message'