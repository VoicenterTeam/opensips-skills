## 1.4.�Exported Functions

### 1.4.1.� `trie_search(number, [flags], [trie_attrs_pvar], [match_prefix_pvar], [partition])`

Function to search for an entry ( number ) in a trie.

This function can be used from all routes.

If you set `use_partitions` to 1 the **partition** last parameter becomes mandatory.

All parameters are optional. Any of them may be ignored, provided the necessary separation marks "," are properly placed.

*   **number** (str) - number to be searched in the trie
    
*   **flags** (string, optional) - a list of letter-like flags for controlling the routing behavior. Possible flags are:
    
    *   **L** - Do strict length matching over the prefix - actually the trie engine will do full number matching and not prefix matching anymore.
        
    
*   **trie\_attrs\_pvar** (var, optional) - a writable variable which will be populated with the attributes of the matched trie rule.
    
*   **match\_prefix\_pvar** (var, optional) - a writable variable which will be the actual prefix matched in the trie.
    
*   **partition** (string, optional) - the name of the trie partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on.
    

**Example�1.7.�`trie_search` usage**

...
if (trie\_search("$rU","L",$avp(code\_attrs),,"my\_partition")) {
    # we found it in the trie, it's a match
    xlog("We found $rU in the trie with attrs $avp(code\_attrs) \\n");
}