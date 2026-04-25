## 1.5.�Exported MI Functions

### 1.5.1.�`httpd_list_root_path`

Lists all the registered http root paths into the httpd module. When a request comes in, if the root parth is in the list, the request will be sent to the module that register it.

Name: _httpd\_list\_root\_path_

Parameters: none

MI FIFO Command Format:

opensips-cli -x mi httpd\_list\_root\_path