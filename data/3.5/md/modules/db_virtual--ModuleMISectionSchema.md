## 1.4.�Exported MI Functions

### 1.4.1.� `db_get`

Return information about global state of the real dbs.

Name: _db\_get_

Parameters:

*   None.
    

MI FIFO Command Format:

				opensips-cli -x mi db\_get
			

### 1.4.2.� `db_set`

Sets the permissions for real dbs access per set per db.

Sets the reconnect reset flag.

Name: _db\_set_

Parameters:

*   set\_index \[int\]
*   db\_url\_index \[int\]
*   may\_use\_db\_flag \[boolean\]
*   ignore\_retries\[boolean\](optional)

db\_set 3 2 0 1 means:

*   3 - the fourth set (must exist)
*   2 - the third URL in the fourth set(must exist)
*   0 - processes are not allowed to use that URL
*   1 - reset and suppress db\_max\_consec\_retrys

MI FIFO Command Format:

				opensips-cli -x mi db\_set 3 2 0 1