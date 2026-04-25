## 1.5.�Exported Parameters

### 1.5.1.�`fifo_name` (string)

The name of the FIFO file to be created for listening and reading external commands.

_NOTE:_Starting with Linux kernel 4.19, processes can no longer read from FIFO files that are saved in directories with sticky bits (such as _/tmp_) and are not owned by the same user the process runs with. This prevents external tools (such as _opensips-cli_) from running MI commands using a different user (a _Permissions denied_ error is triggered). If you are getting this error while trying to use _opensips-cli_, you can fix it by either store the fifo file in a non-sticky bit directory (such as _/run/opensips_), or disable the fifo protection using _sysctl fs.protected\_fifos = 0_ (NOT RECOMMENDED).

_Default value is "/tmp/opensips\_fifo"._

**Example�1.1.�Set `fifo_name` parameter**

...
modparam("mi\_fifo", "fifo\_name", "/tmp/opensips\_b2b\_fifo")
...

  

### 1.5.2.�`fifo_mode` (integer)

Permission to be used for creating the listening FIFO file. It follows the UNIX conventions.

_Default value is 0660 (rw-rw----)._

**Example�1.2.�Set `fifo_mode` parameter**

...
modparam("mi\_fifo", "fifo\_mode", 0600)
...

  

### 1.5.3.�`fifo_group` (integer) `fifo_group` (string)

Group to be used for creating the listening FIFO file.

_Default value is the inherited one._

**Example�1.3.�Set `fifo_group` parameter**

...
modparam("mi\_fifo", "fifo\_group", 0)
modparam("mi\_fifo", "fifo\_group", "root")
...

  

### 1.5.4.�`fifo_user` (integer) `fifo_group` (string)

User to be used for creating the listening FIFO file.

_Default value is the inherited one._

**Example�1.4.�Set `fifo_user` parameter**

...
modparam("mi\_fifo", "fifo\_user", 0)
modparam("mi\_fifo", "fifo\_user", "root")
...

  

### 1.5.5.�`reply_dir` (string)

Directory to be used for creating the reply FIFO files.

_Default value is “/tmp/”_

**Example�1.5.�Set `reply_dir` parameter**

...
modparam("mi\_fifo", "reply\_dir", "/home/opensips/tmp/")
...

  

### 1.5.6.�`pretty_printing` (int)

Indicates whether the JSONRPC responses sent through MI should be pretty-printed or not.

_Default value is “0 - no pretty-printing”._

**Example�1.6.�Set `pretty_printing` parameter**

...
modparam("mi\_fifo", "pretty\_printing", 1)
...

  

### 1.5.7.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. This is where traced mi messages will go.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.7.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "trace\_destination", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi\_fifo", "trace\_destination", "hep\_dest")
...

  

### 1.5.8.�`trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. **trace\_destination** must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

Defining a blacklists means all the commands that are not blacklisted will be traced. Defining a whitelist means all the commands that are not whitelisted will not be traced. **WARNING:** One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep)**.

_Default value is none(not defined)._

**Example�1.8.�Set `trace_destination` parameter**

...
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi\_fifo", "trace\_bwlist", "b: ps, which")
...
## allow only sip\_trace mi command
## all the other commands will not be traced
modparam("mi\_fifo", "trace\_bwlist", "w: sip\_trace")
...