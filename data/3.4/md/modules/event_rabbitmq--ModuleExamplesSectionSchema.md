## 1.7.�Example

This is an example of an event raised by the pike module when it decides an ip should be blocked:

**Example�1.4.�E\_PIKE\_BLOCKED event**

{
  "jsonrpc": "2.0",
  "method": "E\_PIKE\_BLOCKED",
  "params": {
    "ip": "192.168.2.11"
  }
}

  

**Example�1.5.�RabbitMQ socket**

	rabbitmq:guest:guest@127.0.0.1:5672/pike

	# same socket can be written as
	rabbitmq:127.0.0.1/pike

	# TLS broker connection
	rabbitmq:127.0.0.1/tls\_domain=rmq?pike