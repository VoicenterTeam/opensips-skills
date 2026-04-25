# event\_sqs Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5530224)

2.2. [Most recently active contributors(1) to this module](#idp5593168)

**List of Examples**

1.1. [Set queue\_url parameter](#idp165632)

1.2. [sqs\_publish\_message() function usage](#idp5512272)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The event\_sqs module is an implementation of an Amazon SQS producer. It serves as a transport backend for the Event Interface and also provides a stand-alone connector to be used from the OpenSIPS script in order to publish messages to SQS queues.

[https://aws.amazon.com/sqs/](https://aws.amazon.com/sqs/)

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

There is no need to load any module before this module.

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _AWS SDK for C++:_
    
    By following these steps, you'll have the AWS SDK for C++ installed and configured on your Linux system, allowing you to integrate with SQS: [AWS SDK for C++ Installation Guide](https://docs.aws.amazon.com/sdk-for-cpp/v1/developer-guide/setup-linux.html)
    
    Additional instructions for installation can be found at: [AWS SDK for C++ GitHub Repository](https://github.com/aws/aws-sdk-cpp)
    

### 1.2.3.�Deploying Amazon SQS locally on your computer

For testing purposes, you can run SQS locally. To achieve this, you start localstack on your computer:

pip install localstack
localstack start
		

Don't forget to set the necessary environment variables for testing, for example:

export AWS\_ACCESS\_KEY\_ID=test
export AWS\_SECRET\_ACCESS\_KEY=test
export AWS\_DEFAULT\_REGION=us-east-1
		

Here you can find some cli commands such as create-queue, send/receive-message, etc.: [https://docs.aws.amazon.com/cli/latest/reference/sqs/](https://docs.aws.amazon.com/cli/latest/reference/sqs/)

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
    		
    

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Alexandra Titoc

28

7

1629

366

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

5

3

9

4

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2024 - Sep 2024

2.

Alexandra Titoc

Aug 2024 - Aug 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Alexandra Titoc.

_Documentation Copyrights:_

Copyright � 2024 [www.opensips-solutions.com](http://www.opensips-solutions.com/)