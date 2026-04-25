## 1.4.�Exported Functions

### 1.4.1.� `correlate(hep_id, type1, correlation1, type2, correlation2)`

Send a hep message with an extra correlation id containing the two correlation given as arguments. The two types must differ. This will help on the capturing side to correlate two calls for example, being given their callid as correlation ids.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE.

Meaning of the parameters is as follows:

*   _hep\_id (string)_ the name of the _hep\_id_ defined in modparam section, specifying where to do the tracing.
    
*   _type1 (string)_ the key name identify the first correlation id.
    
*   _correlation1 (string)_ the first extra correlation id that will be put in the extra correlation chunk.
    
*   _type2 (string)_ the key name identify the second correlation id.
    
*   _correlation2 (string)_ the second extra correlation id that will be put in the extra correlation chunk.
    

**Example�1.14.�`correlate` usage**

...
/\* see declaration of hep\_dst in trace\_id section \*/
/\* we suppose we have two correlations in two varibles: cor1 and cor2 \*/
	correlate("hep\_dst", "correlation-no-1",$var(cor1),"correlation-no-2", $var(cor2));
...