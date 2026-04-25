## 1.4.�Exported Functions

### 1.4.1.�sqs\_publish\_message(queue\_id, message)

Publishes a message to an SQS queue. As the actual send operation is done asynchronously, this function does not block and returns immediately after queuing the message for sending.

This function can be used from any route.

The function has the following parameters:

*   _queue\_id (string)_ The ID of the SQS queue. Must be one of the IDs defined through the \`queue\_url\` modparam.
    
*   _message (string)_ - The payload of the message to publish.
    

**Example�1.2.�sqs\_publish\_message() function usage**

...

$var(msg) = "Hello, this is a message to SQS!";
sqs\_publish\_message("q1", $var(msg));

...