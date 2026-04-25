# cachedb\_dynamodb Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5617504)

2.2. [Most recently active contributors(1) to this module](#idp5680976)

**List of Examples**

1.1. [Set `cachedb_url` parameter](#idp5566528)

1.2. [Use Dynamodb servers](#idp5569424)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a cachedb system designed to work with Amazon DynamoDB. It uses the AWS SDK library for C++ to connect to a DynamoDB instance. It leverages the Key-Value interface exported from the core.

[https://aws.amazon.com/pm/dynamodb/](https://aws.amazon.com/pm/dynamodb/)

### 1.1.1.�Functionalities

*   _set_ \- sets a key in DynamoDB using the _cachedb\_store_ function
    
*   _get_ \- queries a key from DynamoDB using the _cachedb\_fetch_ function
    
*   _remove_ \- removes a key from DynamoDB using the _cachedb\_remove_ function
    
*   _get\_counter_ \- queries a key with a numerical value from DynamoDB using the _cachedb\_counter\_fetch_ function
    
*   _add_ \- increments the value of a specific item with a given value using the _cachedb\_add_ function
    
*   _sub_ \- decrements the value of a specific item with a given value using the _cachedb\_sub_ function
    

The following are internally used by OpenSIPS:

*   _map\_get_
    
*   _map\_set_
    
*   _map\_remove_
    

### 1.1.2.�Table Format and TTL Option

The tables used with DynamoDB must adhere to a specific format. Below is an example of creating a table:

aws dynamodb create-table \\
--table-name TableName \\
--attribute-definitions \\
	AttributeName=KeyName,AttributeType=S \\
--key-schema \\
	AttributeName=KeyName,KeyType=HASH \\
--provisioned-throughput \\
	ReadCapacityUnits=5,WriteCapacityUnits=5 \\
--table-class STANDARD
			

If you create the table using the above command, then you have to specify the key in the cachedb\_url: _modparam("cachedb\_dynamodb", "cachedb\_url", "dynamodb://localhost:8000/TableName?key=KeyName;val=ValName")"_

For additional examples of how cachedb\_url should be formatted, refer to the [cachedb\_url (string)](#param_cachedb_url "1.5.1.�cachedb_url (string)") section.

To enable TTL (Time to Live) for the table, which can be used with operations like set, add, and subtract, you can update the table with the TTL option:

aws dynamodb update-time-to-live --table-name TableName --time-to-live-specification
"Enabled=true, AttributeName=ttl"
			

For additional information about the table format and TTL options, follow these links:

[Creating a Table](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-1.html)

[Time to Live (TTL)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-how-to.html)

## 1.2.�Advantages

*   _scalable and fully managed NoSQL database service provided by AWS_
    
*   _integrated with other AWS services, providing robust security and scalability features_
    
*   _high availability and durability due to data replication across multiple AWS Availability Zones_
    
*   _serverless architecture, reducing operational overhead_
    
*   _offers single-digit response times, with DynamoDB Accelerator (DAX) for even lower latencies_
    

## 1.3.�Limitations

*   _relies heavily on indexes; without them, querying involves costly full table scans_
    
*   _does not support table joins, limiting complex queries involving multiple tables_
    
*   _item size limit:each item has a size limit of 400KB, which cannot be increased._
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

There is no need to load any module before this module.

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _AWS SDK for C++:_
    
    By following these steps, you'll have the AWS SDK for C++ installed and configured on your Linux system, allowing you to integrate with DynamoDB: [AWS SDK for C++ Installation Guide](https://docs.aws.amazon.com/sdk-for-cpp/v1/developer-guide/setup-linux.html)
    
    Additional instructions for installation can be found at: [AWS SDK for C++ GitHub Repository](https://github.com/aws/aws-sdk-cpp)
    

### 1.4.3.�Deploying DynamoDB locally on your computer

For testing purposes, you can run a DynamoDB locally. To achieve this, you should follow [these](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html) steps in order to deploy dynamodb locally.

Don't forget to always run the server using this command: `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb` in the directory where you extracted _DynamoDBLocal.jar_.

## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to use, from script, the cache\_store(), cache\_fetch(), etc. operations. It may be set more than once. The prefix part of the URL will be the identifier that will be used from the script.

There are some default parameters that can appear in the URL:

*   _region_ - specifies the AWS region where the DynamoDB table is located
    
*   _key_ - specifies the table's Key column; default value is _"opensipskey"_
    
*   _val_ - specifies the table's Value column on which cache operations such as cache\_store, cache\_fetch, etc., will be performed; default value is _"opensipsval"_
    

Syntax for _cachedb\_url_

*   when using a previously created table (you have to specify the key and value):
    
    *   host and port
        
        `_"dynamodb://id_host:id_port/tableName?key=key1;val=val1"_`
    *   region
        
        `_"dynamodb:///tableName?region=regionName;key=key2;val=val2"_`
    
*   when using the default key and value:
    
    *   host and port
        
        `_"dynamodb://id_host:id_port/tableName"_`
    *   region
        
        `_"dynamodb:///tableName?region=regionName"_`
    

**Example�1.1.�Set `cachedb_url` parameter**

...

# single-instance URLs
modparam("cachedb\_dynamodb", "cachedb\_url", "dynamodb://localhost:8000/table1")
modparam("cachedb\_dynamodb", "cachedb\_url", "dynamodb:///table2?region=central-1")


# multi-instance URL (will perform circular **failover** on each query)
modparam("cachedb\_dynamodb", "cachedb\_url", 
	"dynamodb://localhost:8000/table1?key=Key;val=Val")
modparam("cachedb\_dynamodb", "cachedb\_url", 
	"dynamodb:///table2?region=central-1;key=Key;val=Val")


...
		

  

**Example�1.2.�Use Dynamodb servers**

...

cache\_store("dynamodb", "call1", "10");
cache\_store("dynamodb", "call2", "25", 150) // expires = 150s -optional
cache\_fetch("dynamodb", "call1", $var(total));
cache\_remove("dynamodb", "call1");


cache\_store("dynamodb", "counter1", "200");
cache\_sub("dynamodb", "counter1", 4, 1000); // expires = 1000s -mandatory parameter
cache\_add("dynamodb", "call2", 5, 0) // -this update will not expire  -mandatory parameter
cache\_remove("dynamodb", "counter1");

...
		

  

## 1.6.�Exported Functions

The module does not export functions to be used in configuration script.

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

68

17

3573

1192

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

6

2

0

213

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Alexandra Titoc

Jul 2024 - Sep 2024

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2024 - Aug 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Alexandra Titoc.

_Documentation Copyrights:_

Copyright � 2024 [www.opensips-solutions.com](http://www.opensips-solutions.com/)