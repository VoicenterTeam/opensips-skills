## 1.4.�Exported Functions

### 1.4.1.� `rabbitmq_publish(server_id, routing_key, message [, [content_type [, headers, headers_vals]]])`

Sends a publish message to a RabbitMQ server.

This function also allows you to attach AMQP headers and values in the AMQP message. This is done by specifying a set of headers names (in the _headers_ parameter) and the corresponding values (in the _headers\_vals_ parameter). The number of AVP values in the _headers_ must be the same as the one in the _headers\_vals_.

This function can be used from any route.

The function has the following parameters:

*   _server\_id_ (string) - the id of the RabbitMQ server. Must be one of the parameters defined in the _server\_id_ modparam.
    
*   _routing\_key_ (string) - routing key used to deliver the AMQP message.
    
*   _message_ (string) - the body of the message.
    
*   _content\_type_ (string, optional) - content type of the message sent. By default it is _none_.
    
*   _headers_ (string, optional) - an AVP containing the names of the headers within the AMQP message. If set, _headers\_vals_ parameter must also be specified.
    
*   _headers\_vals_ (string, optional) - an AVP containing the corresponding values of the AMQP headers. If set, _headers_ parameter must also be specified.
    

**Example�1.5.�`rabbitmq_publish()` function usage**

	...
	rabbitmq\_publish("ID1", "call", "$fU called $rU");
	...
	rabbitmq\_publish("ID1", "call", "{ \\'caller\\': \\'$fU\\',
					\\'callee\\; \\'$rU\\'", "application/json");
	...
	$avp(hdr\_name) = "caller";
	$avp(hdr\_value) = $fU;
	$avp(hdr\_name) = "callee";
	$avp(hdr\_value) = $rU;
	rabbitmq\_publish("ID2", "call", $rb, , $avp(hdr\_name), $avp(hdr\_value));
	...