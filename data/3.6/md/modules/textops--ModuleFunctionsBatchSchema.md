## 1.3.�Exported Functions

### 1.3.1.� `search(re)`

Searches for the re in the message.

Meaning of the parameters is as follows:

*   _re_ (string) - Regular expression.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.1.�`search` usage**

...
if ( search("\[Ss\]\[Ii\]\[Pp\]") ) { /\*....\*/ };
...

  

### 1.3.2.� `search_body(re)`

Searches for the re in the body of the message.

Meaning of the parameters is as follows:

*   _re_ (string) - Regular expression.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.2.�`search_body` usage**

...
if ( search\_body("\[Ss\]\[Ii\]\[Pp\]") ) { /\*....\*/ };
...

  

### 1.3.3.� `search_append(re, txt)`

Searches for the first match of re and appends txt after it.

Meaning of the parameters is as follows:

*   _re_ (string) - Regular expression.
    
*   _txt_ (string) - String to be appended.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.3.�`search_append` usage**

...
search\_append("\[Oo\]pen\[Ss\]er", " SIP Proxy");
...

  

### 1.3.4.� `search_append_body(re, txt)`

Searches for the first match of re in the body of the message and appends txt after it.

Meaning of the parameters is as follows:

*   _re_ (string) - Regular expression.
    
*   _txt_ (string) - String to be appended.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.4.�`search_append_body` usage**

...
search\_append\_body("\[Oo\]pen\[Ss\]er", " SIP Proxy");
...

  

### 1.3.5.� `replace(re, txt)`

Replaces the first occurrence of re with txt.

Meaning of the parameters is as follows:

*   _re_ (string) - Regular expression.
    
*   _txt_ (string)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.5.�`replace` usage**

...
replace("opensips", "Open SIP Server");
...

  

### 1.3.6.� `replace_body(re, txt)`

Replaces the first occurrence of re in the body of the message with txt.

Meaning of the parameters is as follows:

*   _re_ (string) - Regular expression.
    
*   _txt_ (string)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.6.�`replace_body` usage**

...
replace\_body("opensips", "Open SIP Server");
...

  

### 1.3.7.� `replace_all(re, txt)`

Replaces all occurrence of re with txt.

Meaning of the parameters is as follows:

*   _re_ - (string) Regular expression.
    
*   _txt_ (string)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.7.�`replace_all` usage**

...
replace\_all("opensips", "Open SIP Server");
...

  

### 1.3.8.� `replace_body_all(re, txt)`

Replaces all occurrence of re in the body of the message with txt. Matching is done on a per-line basis.

Meaning of the parameters is as follows:

*   _re_ (string) - Regular expression.
    
*   _txt_ (string)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.8.�`replace_body_all` usage**

...
replace\_body\_all("opensips", "Open SIP Server");
...

  

### 1.3.9.� `replace_body_atonce(re, txt)`

Replaces all occurrence of re in the body of the message with txt. Matching is done over the whole body.

Meaning of the parameters is as follows:

*   _re_ (string) - Regular expression.
    
*   _txt_ (string)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.9.�`replace_body_atonce` usage**

...
# strip the whole body from the message:
if(has\_body() && replace\_body\_atonce("^.+$", ""))
        remove\_hf("Content-Type"); 
...

  

### 1.3.10.� `subst('/re/repl/flags')`

Replaces re with repl (sed or perl like).

Meaning of the parameters is as follows:

*   _'/re/repl/flags'_ (string) - sed like regular expression. flags can be a combination of i (case insensitive), g (global) or s (match newline don't treat it as end of line).
    
    're' - is regular expression
    
    'repl' - is replacement string - may contain pseudo-variables
    
    'flags' - substitution flags (i - ignore case, g - global)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.10.�`subst` usage**

...
# replace the uri in to: with the message uri (just an example)
if ( subst('/^To:(.\*)sip:\[^@\]\*@\[a-zA-Z0-9.\]+(.\*)$/t:\\1\\u\\2/ig') ) {};

# replace the uri in to: with the value of avp sip\_address (just an example)
if ( subst('/^To:(.\*)sip:\[^@\]\*@\[a-zA-Z0-9.\]+(.\*)$/t:\\1$avp(sip\_address)\\2/ig') ) {};

...

  

### 1.3.11.� `subst_uri('/re/repl/flags')`

Runs the re substitution on the message uri (like subst but works only on the uri)

Meaning of the parameters is as follows:

*   _'/re/repl/flags'_ (string) - sed like regular expression. flags can be a combination of i (case insensitive), g (global) or s (match newline don't treat it as end of line).
    
    're' - is regular expression
    
    'repl' - is replacement string - may contain pseudo-variables
    
    'flags' - substitution flags (i - ignore case, g - global)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.11.�`subst_uri` usage**

...
# adds 3463 prefix to numeric uris, and save the original uri (\\0 match)
# as a parameter: orig\_uri (just an example)
if (subst\_uri('/^sip:(\[0-9\]+)@(.\*)$/sip:3463\\1@\\2;orig\_uri=\\0/i')){$

# adds the avp 'uri\_prefix' as prefix to numeric uris, and save the original
# uri (\\0 match) as a parameter: orig\_uri (just an example)
if (subst\_uri('/^sip:(\[0-9\]+)@(.\*)$/sip:$avp(uri\_prefix)\\1@\\2;orig\_uri=\\0/i')){$

...

  

### 1.3.12.� `subst_user('/re/repl/flags')`

Runs the re substitution on the message uri (like subst\_uri but works only on the user portion of the uri)

Meaning of the parameters is as follows:

*   _'/re/repl/flags'_ (string) - sed like regular expression. flags can be a combination of i (case insensitive), g (global) or s (match newline don't treat it as end of line).
    
    're' - is regular expression
    
    'repl' - is replacement string - may contain pseudo-variables
    
    'flags' - substitution flags (i - ignore case, g - global)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.12.�`subst` usage**

...
# adds 3463 prefix to uris ending with 3642 (just an example)
if (subst\_user('/3642$/36423463/')){$

...
# adds avp 'user\_prefix' as prefix to username in r-uri ending with 3642
if (subst\_user('/(.\*)3642$/$avp(user\_prefix)\\13642/')){$

...

  

### 1.3.13.� `subst_body('/re/repl/flags')`

Replaces re with repl (sed or perl like) in the body of the message.

Meaning of the parameters is as follows:

*   _'/re/repl/flags'_ (string) - sed like regular expression. flags can be a combination of i (case insensitive), g (global) or s (match newline don't treat it as end of line).
    
    're' - is regular expression
    
    'repl' - is replacement string - may contain pseudo-variables
    
    'flags' - substitution flags (i - ignore case, g - global)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.13.�`subst_body` usage**

...
if (subst\_body("/^o=(\[^ \]\*) /o=$fU /"))
	xlog("successfully prepared an "o" line update!\\n");

...