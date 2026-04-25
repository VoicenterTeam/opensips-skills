## 1.4.�Exported Functions

### 1.4.1.� `pcre_match (string, pcre_regex)`

Matches the given string parameter against the regular expression pcre\_regex, which is compiled into a PCRE object. Returns TRUE if it matches, FALSE otherwise.

Meaning of the parameters is as follows:

*   _string_ - String to compare.
    
*   _pcre\_regex_ (string) - Regular expression to be compiled in a PCRE object.
    

NOTE: To use the "end of line" symbol '$' in the pcre\_regex parameter use '$$'.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.8.� `pcre_match` usage (forcing case insensitive)**

...
if (pcre\_match("$ua", "(?i)^twinkle")) {
    xlog("L\_INFO", "User-Agent matches\\n");
}
...

  

**Example�1.9.� `pcre_match` usage (using "end of line" symbol)**

...
if (pcre\_match($rU, "^user\[1234\]$$")) {  # Will be converted to "^user\[1234\]$"
    xlog("L\_INFO", "RURI username matches\\n");
}
...

  

### 1.4.2.� `pcre_match_group (string [, group])`

It uses the groups readed from the text file (see [Section�1.6.1, “File format”](#file-format-id "1.6.1.�File format")) to match the given string parameter against the compiled regular expression in group number group. Returns TRUE if it matches, FALSE otherwise.

Meaning of the parameters is as follows:

*   _string_ - String to compare.
    
*   _group_ (int) - group to use in the operation. If not specified then 0 (the first group) is used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.10.� `pcre_match_group` usage**

...
if (pcre\_match\_group($rU, 2)) {
    xlog("L\_INFO", "RURI username matches group 2\\n");
}
...