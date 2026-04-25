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