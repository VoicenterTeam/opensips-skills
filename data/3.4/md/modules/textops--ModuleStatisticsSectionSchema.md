# textops Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5730448)

2.2. [Most recently active contributors(1) to this module](#idp5834496)

**List of Examples**

1.1. [`search` usage](#idp248752)

1.2. [`search_body` usage](#idp167456)

1.3. [`search_append` usage](#idp5571200)

1.4. [`search_append_body` usage](#idp5578768)

1.5. [`replace` usage](#idp5586224)

1.6. [`replace_body` usage](#idp5593680)

1.7. [`replace_all` usage](#idp5601136)

1.8. [`replace_body_all` usage](#idp5608720)

1.9. [`replace_body_atonce` usage](#idp5616304)

1.10. [`subst` usage](#idp5624496)

1.11. [`subst_uri` usage](#idp5632704)

1.12. [`subst` usage](#idp5641600)

1.13. [`subst_body` usage](#idp5649776)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module implements text based operations over the SIP message processed by OpenSIPS. SIP is a text based protocol and the module provides a large set of very useful functions to manipulate the message at text level, e.g., regular expression search and replace, Perl-like substitutions, etc.

Note: all SIP-aware functions like _insert\_hf_, _append\_hf_ or _codec_ operations have been moved to the _sipmsgops_ module.

### 1.1.1.�Known Limitations

search ignores folded lines. For example, search(“(From|f):.\*@foo.bar”) doesn't match the following From header field:

From: medabeda 
 <sip:medameda@foo.bar>;tag=1234

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

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

  

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

55

43

440

475

2.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

40

28

938

201

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

39

6

16

1952

4.

Andrei Dragus

32

15

1540

196

5.

Andrei Pelinescu-Onciul

28

21

446

134

6.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

18

14

293

45

7.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

10

32

60

8.

Jan Janak ([@janakj](https://github.com/janakj))

12

6

496

27

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

10

5

129

147

10.

Juha Heinanen ([@juha-h](https://github.com/juha-h))

8

5

210

8

  

**All remaining contributors**: Elena-Ramona Modroiu, Henning Westerholt ([@henningw](https://github.com/henningw)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Anca Vamanu, Marc Haisenko, Andreas Heise, Klaus Darilion, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Andreas Granig, Hugues Mitonneau, Konstantin Bokarius, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Christophe Sollet ([@csollet](https://github.com/csollet)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Oct 2013 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jul 2004 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Sep 2019

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jul 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2002 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Anca Vamanu

Oct 2008 - May 2011

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Dec 2010 - Jan 2011

9.

Christophe Sollet ([@csollet](https://github.com/csollet))

Dec 2010 - Dec 2010

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Oct 2010 - Oct 2010

  

**All remaining contributors**: Andrei Dragus, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Hugues Mitonneau, Andreas Granig, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Andreas Heise, Klaus Darilion, Marc Haisenko, Elena-Ramona Modroiu, Andrei Pelinescu-Onciul, Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Andrei Dragus, Anca Vamanu, Andreas Granig, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Klaus Darilion, Marc Haisenko, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Andrei Pelinescu-Onciul.

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS