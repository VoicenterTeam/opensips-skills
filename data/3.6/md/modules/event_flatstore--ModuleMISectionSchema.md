## 1.7.�Exported MI Functions

### 1.7.1.� `evi_flat_rotate`

It makes the processes reopen the file specified as a parameter to the command in order to be compatible with a logrotate command. If the function is not called after the mv command is executed, the module will continue to write in the renamed file.

Name: _evi\_flat\_rotate_

Parameters: _path\_to\_file_

MI FIFO Command Format:

opensips-cli -x mi evi\_flat\_rotate \_path\_to\_log\_file\_