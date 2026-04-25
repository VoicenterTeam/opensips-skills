## 1.3.�Exported Parameters

### 1.3.1.� `db_urls` (str)

Multiple value parameter used for virtual DB URLs declaration.

**Example�1.1.�Set `db_urls` parameter**

...

modparam("group","db\_url","virtual://set1")
modparam("presence|presence\_xml", "db\_url","virtual://set2")

modparam("db\_virtual", "db\_urls", "define set1 PARALLEL")
modparam("db\_virtual", "db\_urls", "mysql://opensips:opensipsrw@localhost/testa")
modparam("db\_virtual", "db\_urls", "postgres://opensips:opensipsrw@localhost/opensips")

modparam("db\_virtual", "db\_urls", "define set2 FAILOVER")
modparam("db\_virtual", "db\_urls", "mysql://opensips:opensipsrw@localhost/testa")
...
				

  

### 1.3.2.� `db_probe_time` (integer)

Time interval after which a registered timer process attempts to check failed(as reported by other processes) connections to real dbs. The probe will connect and disconnect to the failed real DB and announce others.

_Default value is 10 (10 sec)._

**Example�1.2.�Set `db_probe_time` parameter**

...
modparam("db\_virtual", "db\_probe\_time", 20)
...
				

  

### 1.3.3.� `db_max_consec_retrys` (integer)

After the timer process has reported that it can connect to the real db, other processes will try to reconnect to it. There are cases where although the probe could connect some might fail. This parameter represents the number of consecutive failed retries that a process will do before it gives up. This value is reset and suppressed by a MI function(db\_set).

_Default value is 10 (10 consecutive times)._

**Example�1.3.�Set `db_max_consec_retrys` parameter**

...
modparam("db\_virtual", "db\_max\_consec\_retrys", 20)
...