## 1.3.�Exported Parameters

### 1.3.1.�`queue_url` (string)

This parameter specifies the configuration for an SQS queue that can be used to publish messages directly from the script, using the sqs\_publish\_message() function or to send messages using raise\_event function.

The format of the parameter is: \[ID\]sqs\_url, where ID is an identifier for this SQS queue instance and sqs\_url is the full url of the queue.

The queue\_url contains:

*   _endpoint_
    
*   _region_
    

This parameter can be set multiple times.

**Example�1.1.�Set queue\_url parameter**

...

modparam("event\_sqs", "queue\_url",
	  "\[q1\]https://sqs.us-west-2.amazonaws.com/123456789012/Queue1")

modparam("event\_sqs", "queue\_url",
	  "\[q2\]http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/Queue2")

...