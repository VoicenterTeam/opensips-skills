## 1.5.�Exported Parameters

### 1.5.1.�luafilename (string)

This is the file name of your script. This may be set once only, but it may include an arbitary number of functions and "use" as many Lua module as necessary.

The default value is "/etc/opensips/opensips.lua"

**Example�1.1.�Set luafilename parameter**

...
modparam("lua", "luafilename", "/etc/opensips/opensips.lua")
...
        

  

### 1.5.2.�lua\_auto\_reload (int)

Define this value to 1 if you want to reload automatically the lua script. Disabled by default.

### 1.5.3.�warn\_missing\_free\_fixup (int)

When you call a function via moduleFunc() you could have a memleak. Enable this warns you when you're doing it. Enabled by default.

### 1.5.4.�lua\_allocator (string)

Change the default memory allocator for the lua module. Possible values are :

*   opensips (default)
    
*   malloc