## 1.6.�Exported Functions

### 1.6.1.� `kafka_publish(broker_id, message, [key], [report_route])`

Publishes a message to a Kafka broker (or cluster). As the actual send operation is done in an asynchronous manner, a report route may be provided in order to check the message delivery status.

Returns _1_ if the message was succesfully queued for sending or _\-1_ otherwise.

This function can be used from any route.

The function has the following parameters:

*   _broker\_id_ (string) - the ID of the Kafka broker (or cluster). Must be one of the IDs defined through the [broker\_id](#param_broker_id "1.5.1.�broker_id (string)") modparam.
    
*   _message_ (string) - the payload of the Kafka message to publish.
    
*   _key_ (string, optional) - the key of the Kafka record to publish.
    
*   _report\_route_ (string, static, optional) - name of a script route to be executed when the message delivery status is available. Information about the message publishing will be available in this route through the following AVP variables:
    
    *   _$avp(kafka\_id)_ - broker ID
        
    *   _$avp(kafka\_status)_ - delivery status, 0 if succesfull, -1 othewise
        
    *   _$avp(kafka\_key)_ - message key
        
    *   _$avp(kafka\_msg)_ - message payload
        
    

**Example�1.2.�`kafka_publish()` function usage**

	...
	$var(msg) = "my msg content";
	kafka\_publish("k1", $var(kmsg), $ci, "kafka\_report");
	...
	route\[kafka\_report\] {
		xlog("Delivery status: $avp(kafka\_status) for broker: $avp(kafka\_id)\\n");
	}
	...