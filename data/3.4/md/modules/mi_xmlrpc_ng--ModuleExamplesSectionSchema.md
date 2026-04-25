## 1.6.�Example

This is an example showing the xmlrpc format for the “get\_statistics net: shmem:” MI commad: response.

**Example�1.4.�XMLRPC request**

POST /xmlrpc HTTP/1.0
Host: my.host.com
User-Agent: My xmlrpc UA
Content-Type: text/xml
Content-Length: 216

<?xml version='1.0'?>
<methodCall>
	<methodName>get\_statistics</methodName>
	<params>
		<param>
		<value>
		<struct>
		<member>
			<name>statistics</name>
			<value>
			<array>
			<data>
				<value><string>shmem:</string></value>
				<value><string>core:</string></value>
			</data>
			</array>
			</value>
		</member>
		</struct>
		</value>
		</param>
	</params>
</methodCall>


HTTP/1.0 200 OK
Content-Length: 236
Content-Type: text/xml; charset=utf-8
Date: Mon, 8 Mar 2013 12:00:00 GMT

<?xml version="1.0" encoding="UTF-8"?>.
<methodResponse>
<params><param>
<value><struct><member><name>net:waiting\_udp</name><value><string>0</string></value></member><member><name>net:waiting\_tcp</name><value><string>0</string></value></member><member><name>net:waiting\_tls</name><value><string>0</string></value></member><member><name>shmem:total\_size</name><value><string>268435456</string></value></member><member><name>shmem:used\_size</name><value><string>40032</string></value></member><member><name>shmem:real\_used\_size</name><value><string>277112</string></value></member><member><name>shmem:max\_used\_size</name><value><string>277112</string></value></member><member><name>shmem:free\_size</name><value><string>268158344</string></value></member><member><name>shmem:fragments</name><value><string>194</string></value></member></struct></value></param></params>
</methodResponse>.