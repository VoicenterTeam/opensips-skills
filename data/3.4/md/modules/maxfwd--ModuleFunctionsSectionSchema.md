## 1.4.�Exported Functions

### 1.4.1.� `mf_process_maxfwd_header(max_value)`

If no Max-Forward header is present in the received request, a header will be added having the original value equal with “max\_value”. If a Max-Forward header is already present, its value will be decremented (if not 0).

Retuning codes:

*   _2 (true)_ - header was not found and a new header was successfully added.
    
*   _1 (true)_ - header was found and its value was successfully decremented (had a non-0 value).
    
*   _\-1 (false)_ - the header was found and its value is 0 (cannot be decremented).
    
*   _\-2 (false)_ - error during processing.
    

The return code may be extensivly tested via script variable “retcode” (or “$?”).

Meaning of the parameters is as follows:

*   _max\_value_ (int) - Value to be added if there is no Max-Forwards header field in the message.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.2.�`mx_process_maxfwd_header` usage**

...
# initial sanity checks -- messages with
# max\_forwards==0, or excessively long requests
if (!mf\_process\_maxfwd\_header(10) && $retcode==-1) {
	sl\_send\_reply(483,"Too Many Hops");
	exit;
};
...

  

### 1.4.2.� `is_maxfwd_lt(max_value)`

Checks if the Max-Forward header value is less then the “max\_value” parameter value. It considers also the value of the new inserted header (if locally added).

Retuning codes:

*   _1 (true)_ - header was found or set and its value is strictly less than “max\_value”.
    
*   _\-1 (false)_ - the header was found or set and its value is greater or equal to “max\_value”.
    
*   _\-2 (false)_ - header was not found or not set.
    
*   _\-3 (false)_ - error during processing.
    

The return code may be extensivly tested via script variable “retcode” (or “$?”).

Meaning of the parameters is as follows:

*   _max\_value_ (int) - value to check the Max-Forward.value against (as less than).
    

**Example�1.3.�`is_maxfwd_lt` usage**

...
# next hope is a gateway, so make no sens to
# forward if MF is 0 (after decrement)
if ( is\_maxfwd\_lt(1) ) {
	sl\_send\_reply(483,"Too Many Hops");
	exit;
};
...