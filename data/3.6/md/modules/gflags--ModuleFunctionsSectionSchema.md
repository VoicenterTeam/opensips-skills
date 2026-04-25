## 1.4.�Exported Functions

### 1.4.1.�`set_gflag(flag)`

Set the bit at the position “flag” in global flags.

The “flag” (int) parameter can have a value in the range of 0..31.

This function may be used from any route.

**Example�1.2.�`set_gflag()` usage**

...
set\_gflag(4);
...

  

### 1.4.2.�`reset_gflag(flag)`

Reset the bit at the position “flag” in global flags.

The “flag” (int) parameter can have a value in the range of 0..31.

This function may be used from any route.

**Example�1.3.�`reset_gflag()` usage**

...
reset\_gflag(4);
...

  

### 1.4.3.�`is_gflag(flag)`

Check if bit at the position “flag” in global flags is set.

The “flag” (int) parameter can have a value in the range of 0..31.

This function may be used from any route.

**Example�1.4.�`is_gflag()` usage**

...
if(is\_gflag(4))
{
	log("global flag 4 is set\\n");
} else {
	log("global flag 4 is not set\\n");
};
...