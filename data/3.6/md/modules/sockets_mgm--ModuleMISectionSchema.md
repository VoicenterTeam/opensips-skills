## 1.6.�Exported MI Functions

### 1.6.1.� `sockets_mgm:reload`

Replaces obsolete MI command: _sockets\_reload_.

MI command used to reload the sockets from the database.

MI FIFO Command Format:

		## reload sockets from the database
		opensips-mi sockets\_mgm:reload
		opensips-cli -x mi sockets\_mgm:reload
		

### 1.6.2.� `sockets_mgm:list`

Replaces obsolete MI command: _sockets\_list_.

MI command to list all the currently used dynamic sockets.

MI FIFO Command Format:

		## reload sockets from the database
		opensips-mi sockets\_mgm:list
		opensips-cli -x mi sockets\_mgm:list