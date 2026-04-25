## 1.4.�Exported Functions

### 1.4.1.� `check_user_blacklist (user, domain, [number], [table])`

Finds the longest prefix that matches the request URI user (or the number parameter) for the given user and domain name in the database. If a match is found and it is not set to whitelist, false is returned. Otherwise, true is returned. The number parameter can be used to check for example against the from URI user.

Parameters:

*   _user_ (string) - description
    
*   _domain_ (string) - description
    
*   _number_ (string, optional) - If ommited, the defalut is used.
    
*   _table_ (string, optional) - If ommited, the defalut is used.
    

**Example�1.4.�`check_user_blacklist` usage**

...
if (!check\_user\_blacklist("user", "domain.com"))
	sl\_send\_reply(403, "Forbidden");
	exit;
}
...
		

  

### 1.4.2.� `check_blacklist (table)`

Finds the longest prefix that matches the request URI for the given table. If a match is found and it is not set to whitelist, false is returned. Otherwise, true is returned.

Parameters:

*   _table_ (string)
    

**Example�1.5.�`check_blacklist` usage**

...
if (!check\_blacklist("global\_blacklist")))
	sl\_send\_reply(403, "Forbidden");
	exit;
}
...