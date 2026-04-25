## 1.4.�Exported Functions

### 1.4.1.� `pua_set_publish()`

The function is used to mark REGISTER requests that have to issue a PUBLISH. The PUBLISH is issued when REGISTER is saved in location table.

**Example�1.4.�`pua_set_publish` usage**

...
if(is\_method("REGISTER") && $fu=~"john@opensips.org") 
	pua\_set\_publish();
...