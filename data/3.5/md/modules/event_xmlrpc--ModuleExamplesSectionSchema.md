## 1.6.�Example

This is an example of an event raised by the pike module when it decides an ip should be blocked:

**Example�1.2.�E\_PIKE\_BLOCKED event**

POST /RPC2 HTTP/1.1.
Host: 127.0.0.1:8081.
Connection: close.
User-Agent: OpenSIPS XMLRPC Notifier.
Content-type: text/xml.
Content-length: 240.
		.
<?xml version="1.0"?>
<methodCall>
	<methodName>e\_dummy\_h</methodName>
	<params>
		<param>
			<value><string>E\_MY\_EVENT</string></value>
		</param>
		<param>
			<name>ip</name>
			<value><string>192.168.2.11</string></value>
		</param>
	</params>
</methodCall>

  

**Example�1.3.�XMLRPC socket**

	# calls the 'block\_ip' function
	xmlrpc:127.0.0.1:8080:block\_ip