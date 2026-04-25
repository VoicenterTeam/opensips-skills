## 1.3.�Exported Parameters

### 1.3.1.�`auto_reload` (integer)

The auto-reload will close and reopen a Berkeley DB when the files inode has changed. The operation occurs only duing a query. Other operations such as insert or delete, do not invoke auto\_reload.

_Default value is 0 (1 - on / 0 - off)._

**Example�1.1.�Set `auto_reload` parameter**

...
modparam("db\_berkeley", "auto\_reload", 1)
...
		

  

### 1.3.2.�`log_enable` (integer)

The log\_enable boolean controls when to create journal files. The following operations can be journaled: INSERT, UPDATE, DELETE. Other operations such as SELECT, do not. This journaling are required if you need to recover from a corrupt DB file. That is, bdb\_recover requires these to rebuild the db file. If you find this log feature useful, you may also be interested in the METADATA\_LOGFLAGS bitfield that each table has. It will allow you to control which operations to journal, and the destination (like syslog, stdout, local-file). Refer to bdblib\_log() and documentation on METADATA.

_Default value is 0 (1 - on / 0 - off)._

**Example�1.2.�Set `log_enable` parameter**

...
modparam("db\_berkeley", "log\_enable", 1)
...
		

  

### 1.3.3.�`journal_roll_interval` (integer seconds)

The journal\_roll\_interval will close and open a new log file. The roll operation occurs only at the end of writing a log, so it is not guaranteed to to roll 'on time'.

_Default value is 0 (off)._

**Example�1.3.�Set `journal_roll_interval` parameter**

...
modparam("db\_berkeley", "journal\_roll\_interval", 3600)
...