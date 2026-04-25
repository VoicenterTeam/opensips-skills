# event_sqs Module Reference
<!-- generated-from: data/3.6/modules/event_sqs.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 event_sqs module. Read this file when configuring or debugging the event_sqs module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The event_sqs module is an implementation of an Amazon SQS producer. It serves as a transport backend for the Event Interface and also provides a stand-alone connector to be used from the OpenSIPS script in order to publish messages to SQS queues.

[https://aws.amazon.com/sqs/](https://aws.amazon.com/sqs/)

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `AWS SDK for C++` — The following libraries or applications must be installed before running OpenSIPS with this module loaded

### Optional Modules

- `localstack`

## Exported Parameters

### `queue_url` (string)

This parameter specifies the configuration for an SQS queue that can be used to publish messages directly from the script, using the sqs\_publish\_message() function or to send messages using raise\_event function.

The format of the parameter is: \[ID\]sqs\_url, where ID is an identifier for this SQS queue instance and sqs\_url is the full url of the queue.

The queue\_url contains:

*   _endpoint_
    
*   _region_

**Notes:** This parameter can be set multiple times.

**Example.** [q1]https://sqs.us-west-2.amazonaws.com/123456789012/Queue1.

```opensips
...

modparam("event\_sqs", "queue_url",
	  "\[q1\]https://sqs.us-west-2.amazonaws.com/123456789012/Queue1")

modparam("event\_sqs", "queue_url",
	  "\[q2\]http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/Queue2")

...
```

## Exported Functions

### `sqs_publish_message(queue_id, message)`

Publishes a message to an SQS queue. As the actual send operation is done asynchronously, this function does not block and returns immediately after queuing the message for sending.

**Parameters:**

- `message` *(string, required)* — The payload of the message to publish.
- `queue_id` *(string, required)* — The ID of the SQS queue. Must be one of the IDs defined through the `queue_url` modparam.

**Usable from:** any route

**Example.** sqs_publish_message() function usage.

```opensips
...
$var(msg) = "Hello, this is a message to SQS!";
sqs_publish_message("q1", $var(msg));
...
```

## Configuration Examples

### Event-Driven Messaging with _Event Interface_

OpenSIPS' event interface can be utilized to send messages to SQS by subscribing to an event and raising it when needed.

```opensips
subscribe_event("MY_EVENT",
	"sqs:http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/Queue2");
		
opensips-cli -x mi event_subscribe MY_EVENT \
	  sqs:http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/Queue2
		
opensips-cli -x mi raise_event MY_EVENT 'OpenSIPS Message'
```

Steps:

* _Event Subscription:_

First, register the event subscription in your OpenSIPS configuration file within the `startup_route`:

* _Event Subscription via CLI:_

After starting OpenSIPS, you can subscribe to the event from another terminal using the OpenSIPS CLI:

* _Raise the Event and Send Message:_

Finally, to send a message, raise the subscribed event with the desired message content:
