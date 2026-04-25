## 1.7.�Example

This is an example of an event raised by the pike module when it decides an ip should be blocked:

**Example�1.1.�E\_PIKE\_BLOCKED event**

{
  "jsonrpc": "2.0",
  "method": "E\_PIKE\_BLOCKED",
  "params": {
    "ip": "192.168.2.11"
  }
}

  

**Example�1.2.�UNIX socket**

unix:/tmp/opensips\_event.sock

  

**Example�1.3.�UDP socket**

udp:127.0.0.1:8081