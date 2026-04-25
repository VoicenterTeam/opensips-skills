## 1.4.�Exported Functions

### 1.4.1.� `sql_cache_dump(caching_id, columns, result_avps)`

Dump all _columns_ cached within the given _caching\_id_, and write them to their respective _result\_avps_.

Parameters:

*   _caching\_id_ (string) - Identifier for the SQL cache
    
*   _columns_ (string) - the desired SQL columns to be dumped, specified as comma-separated values
    
*   _result\_avps_ (string) - comma-separated list of AVPs where the results will be written to
    

Return Codes:

*   **\-1** - Internal Error
    
*   **\-2** - Zero Results Returned
    
*   **1, 2, 3, ...** - Number of results returned into each output AVP
    

This function can be used from any route.

**Example�1.9.�`sql_cache_dump` usage**

...
# Example of pulling all cached CNAM records
$var(n) = sql\_cache\_dump("cnam", "caller,callee,calling\_name,fraud\_score",
                "$avp(caller),$avp(callee),$avp(cnam),$avp(fraud)");
$var(i) = 0;
while ($var(i) < $var(n)) {
	xlog("Caller $(avp(caller)\[$var(i)\]) has CNAM $(avp(cnam)\[$var(i)\])\\n");
	$var(i) += 1;
}
...