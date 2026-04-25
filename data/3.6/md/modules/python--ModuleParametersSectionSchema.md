## 1.3.�Exported Parameters

### 1.3.1.�`script_name` (string)

The script that contains the Python module.

_Default value is “/usr/local/etc/opensips/handler.py”._

**Example�1.1.�Set `script_name` parameter**

...
modparam("python", "script\_name", "/usr/local/bin/opensips\_handler.py")
...

  

### 1.3.2.�`mod_init_function` (string)

The method used to initialize the Python module and return the object.

_Default value is “mod\_init”._

**Example�1.2.�Set `mod_init_function` parameter**

...
modparam("python", "mod\_init\_function", "module\_initializer")
...

  

### 1.3.3.�`child_init_method` (string)

The method called for each child process.

_Default value is “child\_init”._

**Example�1.3.�Set `child_init_method` parameter**

...
modparam("python", "child\_init\_method", "child\_initializer")
...