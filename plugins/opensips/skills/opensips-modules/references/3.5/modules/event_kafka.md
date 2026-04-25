# event_kafka Module Reference
<!-- generated-from: data/3.5/modules/event_kafka.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 event_kafka module. Read this file when configuring or debugging the event_kafka module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of an [Apache Kafka](https://kafka.apache.org/) producer. It serves as a transport backend for the Event Interface and also provides a stand-alone connector to be used from the OpenSIPS script in order to publish messages to Kafka brokers.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `librdkafka-dev` — must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `broker_id` (string)

This parameter specifies the configuration for a Kafka broker (or cluster) that can be used to publish messages directly from the script, using the kafka_publish() function. The format of the parameter is: [ID]kafka_socket, where ID is an identifier for this broker instance and kafka_socket is a specification similar to the Kafka socket syntax.

**Notes:** The key=callid property does not have an effect for brokers configured through this parameter. This parameter can be set multiple times.

**Example.** [k1]127.0.0.1:9092/topic1?g.linger.ms=100&t.acks=all.

```opensips
modparam("event_kafka", "broker_id", "[k1]127.0.0.1:9092/topic1?g.linger.ms=100&t.acks=all")
```

## Exported Functions

### `kafka_publish(broker_id, message, [key], [report_route])`

Publishes a message to a Kafka broker (or cluster). As the actual send operation is done in an asynchronous manner, a report route may be provided in order to check the message delivery status.

**Parameters:**

- `broker_id` *(string, required)* — the ID of the Kafka broker (or cluster). Must be one of the IDs defined through the broker_id modparam.
- `key` *(string, optional)* — the key of the Kafka record to publish.
- `message` *(string, required)* — the payload of the Kafka message to publish.
- `report_route` *(string, optional)* — name of a script route to be executed when the message delivery status is available. Information about the message publishing will be available in this route through the following AVP variables: $avp(kafka_id) - broker ID, $avp(kafka_status) - delivery status, 0 if succesfull, -1 othewise, $avp(kafka_key) - message key, $avp(kafka_msg) - message payload

**Return codes:**

- `1` — if the message was succesfully queued for sending
- `-1` — otherwise

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** kafka_publish() function usage.

```opensips
...
$var(msg) = "my msg content";
kafka\_publish("k1", $var(kmsg), $ci, "kafka\_report");
...
route[kafka\_report] {
	xlog("Delivery status: $avp(kafka_status) for broker: $avp(kafka_id)\n");
}
...
```

## Configuration Examples

### Set `broker_id` parameter

Demonstrates setting the `broker_id` parameter.

```opensips
...
modparam("event_kafka", "broker_id", "[k1]127.0.0.1:9092/topic1?g.linger.ms=100&t.acks=all")
...
```
### `kafka_publish()` function usage

Demonstrates the usage of the `kafka_publish()` function.

```opensips
...
$var(msg) = "my msg content";
kafka_publish("k1", $var(kmsg), $ci, "kafka_report");
...
route[kafka_report] {
	xlog("Delivery status: $avp(kafka_status) for broker: $avp(kafka_id)\n");
}
...
```
### Kafka socket

Demonstrates the Kafka socket syntax.

```opensips
kafka:127.0.0.1:9092/topic1?t.message.timeout.ms=1000&key=callid
```
