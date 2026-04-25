## 1.5.�Exported Parameters

### 1.5.1.�`broker_id` (string)

This parameter specifies the configuration for a Kafka broker (or cluster) that can be used to publish messages directly from the script, using the [kafka\_publish()](#func_kafka_publish "1.6.1.� kafka_publish(broker_id, message, [key], [report_route])") function.

The format of the parameter is: _\[ID\]kafka\_socket_, where _ID_ is an identifier for this broker instance and _kafka\_socket_ is a specification similar to the [Kafka socket syntax](#kafka_socket_syntax "1.2.�Kafka socket syntax").

The _key=callid_ property does not have an effect for brokers configured through this parameter.

This parameter can be set multiple times.

**Example�1.1.�Set `broker_id` parameter**

...
modparam("event\_kafka", "broker\_id", "\[k1\]127.0.0.1:9092/topic1?g.linger.ms=100&t.acks=all")
...