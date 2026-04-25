# Regex Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5667520)

2.2. [Most recently active contributors(1) to this module](#idp5766368)

**List of Examples**

1.1. [Set `file` parameter](#idp103824)

1.2. [Set `max_groups` parameter](#idp171600)

1.3. [Set `group_max_size` parameter](#idp176816)

1.4. [Set `pcre_caseless` parameter](#idp5516784)

1.5. [Set `pcre_multiline` parameter](#idp5522848)

1.6. [Set `pcre_dotall` parameter](#idp5528016)

1.7. [Set `pcre_extended` parameter](#idp5533312)

1.8. [`pcre_match` usage (forcing case insensitive)](#idp5542864)

1.9. [`pcre_match` usage (using "end of line" symbol)](#idp5544992)

1.10. [`pcre_match_group` usage](#idp5566096)

1.11. [regex file](#idp5589584)

1.12. [Using with pua\_usrloc](#idp5593120)

1.13. [Incorrect groups file](#idp5595360)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module offers matching operations against regular expressions using the powerful [PCRE](http://www.pcre.org/) library.

A text file containing regular expressions categorized in groups is compiled when the module is loaded, storing the compiled PCRE objects in an array. A function to match a string or pseudo-variable against any of these groups is provided. The text file can be modified and reloaded at any time via a MI command. The module also offers a function to perform a PCRE matching operation against a regular expression provided as function parameter.

For a detailed list of PCRE features read the [man page](http://www.pcre.org/pcre.txt) of the library.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libpcre-dev - the development libraries of [PCRE](http://www.pcre.org/)_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`file` (string)

Text file containing the regular expression groups. It must be set in order to enable the group matching function.

_Default value is “NULL”._

**Example�1.1.�Set `file` parameter**

...
modparam("regex", "file", "/etc/opensips/regex\_groups")
...

  

### 1.3.2.�`max_groups` (int)

Max number of regular expression groups in the text file.

_Default value is “20”._

**Example�1.2.�Set `max_groups` parameter**

...
modparam("regex", "max\_groups", 40)
...

  

### 1.3.3.�`group_max_size` (int)

Max content size of a group in the text file.

_Default value is “8192”._

**Example�1.3.�Set `group_max_size` parameter**

...
modparam("regex", "group\_max\_size", 16384)
...

  

### 1.3.4.�`pcre_caseless` (int)

If this options is set, matching is done caseless. It is equivalent to Perl's /i option, and it can be changed within a pattern by a (?i) or (?-i) option setting.

_Default value is “0”._

**Example�1.4.�Set `pcre_caseless` parameter**

...
modparam("regex", "pcre\_caseless", 1)
...

  

### 1.3.5.�`pcre_multiline` (int)

By default, PCRE treats the subject string as consisting of a single line of characters (even if it actually contains newlines). The "start of line" metacharacter (^) matches only at the start of the string, while the "end of line" metacharacter ($) matches only at the end of the string, or before a terminating newline.

When this option is set, the "start of line" and "end of line" constructs match immediately following or immediately before internal newlines in the subject string, respectively, as well as at the very start and end. This is equivalent to Perl's /m option, and it can be changed within a pattern by a (?m) or (?-m) option setting. If there are no newlines in a subject string, or no occurrences of ^ or $ in a pattern, setting this option has no effect.

_Default value is “0”._

**Example�1.5.�Set `pcre_multiline` parameter**

...
modparam("regex", "pcre\_multiline", 1)
...

  

### 1.3.6.�`pcre_dotall` (int)

If this option is set, a dot metacharater in the pattern matches all characters, including those that indicate newline. Without it, a dot does not match when the current position is at a newline. This option is equivalent to Perl's /s option, and it can be changed within a pattern by a (?s) or (?-s) option setting.

_Default value is “0”._

**Example�1.6.�Set `pcre_dotall` parameter**

...
modparam("regex", "pcre\_dotall", 1)
...

  

### 1.3.7.�`pcre_extended` (int)

If this option is set, whitespace data characters in the pattern are totally ignored except when escaped or inside a character class. Whitespace does not include the VT character (code 11). In addition, characters between an unescaped # outside a character class and the next newline, inclusive, are also ignored. This is equivalent to Perl's /x option, and it can be changed within a pattern by a (?x) or (?-x) option setting.

_Default value is “0”._

**Example�1.7.�Set `pcre_extended` parameter**

...
modparam("regex", "pcre\_extended", 1)
...

  

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

  

## 1.5.�Exported MI Functions

### 1.5.1.� `regex_reload`

Causes regex module to re-read the content of the text file and re-compile the regular expressions. The number of groups in the file can be modified safely.

Name: _regex\_reload_

Parameters: _none_

MI FIFO Command Format:

...
opensips-cli -x mi regex\_reload
...

### 1.5.2.� `regex_match`

Matches the given string parameter against the regular expression pcre\_regex. Returns "Match" if it matches, "Not Match" otherwise.

Name: _regex\_match_

Parameters:

*   string
    
*   pcre\_regex
    

MI FIFO Command Format:

...
opensips-cli -x mi regex\_match string="1234" pcre\_regex="^1234$"
"Match"
opensips-cli -x mi regex\_match string="1234" pcre\_regex="^1235$"
"Not Match"
...

### 1.5.3.� `regex_match_group`

It uses the groups readed from the text file to match the given string parameter against the compiled regular expression in group number group. Returns "Match" if it matches, "Not Match" otherwise.

Name: _regex\_match\_group_

Parameters:

*   string
    
*   group
    

MI FIFO Command Format:

...
opensips-cli -x mi regex\_match\_group string="1234" group="0"
"Match"
opensips-cli -x mi regex\_match\_group string="1234" group="1"
"Not Match"
...

## 1.6.�Installation and Running

### 1.6.1.�File format

The file contains regular expressions categorized in groups. Each group starts with "\[number\]" line. Lines starting by space, tab, CR, LF or # (comments) are ignored. Each regular expression must take up just one line, this means that a regular expression can't be splitted in various lines.

An example of the file format would be the following:

**Example�1.11.�regex file**

\### List of User-Agents publishing presence status
\[0\]

# Softphones
^Twinkle/1
^X-Lite
^eyeBeam
^Bria
^SIP Communicator
^Linphone

# Deskphones
^Snom

# Others
^SIPp
^PJSUA


### Blacklisted source IP's
\[1\]

^190\\.232\\.250\\.226$
^122\\.5\\.27\\.125$
^86\\.92\\.112\\.


### Free PSTN destinations in Spain
\[2\]

^1\\d{3}$
^((\\+|00)34)?900\\d{6}$

  

The module compiles the text above to the following regular expressions:

group 0: ((^Twinkle/1)|(^X-Lite)|(^eyeBeam)|(^Bria)|(^SIP Communicator)|
          (^Linphone)|(^Snom)|(^SIPp)|(^PJSUA))
group 1: ((^190\\.232\\.250\\.226$)|(^122\\.5\\.27\\.125$)|(^86\\.92\\.112\\.))
group 2: ((^1\\d{3}$)|(^((\\+|00)34)?900\\d{6}$))

The first group can be used to avoid auto-generated PUBLISH (pua\_usrloc module) for UA's already supporting presence:

**Example�1.12.�Using with pua\_usrloc**

route\[REGISTER\] {
    if (! pcre\_match\_group("$ua", 0)) {
        xlog("L\_INFO", "Auto-generated PUBLISH for $fu ($ua)\\n");
        pua\_set\_publish();
    }
    save("location");
    exit;
}

  

NOTE: It's important to understand that the numbers in each group header (\[number\]) must start by 0. If not, the real group number will not match the number appearing in the file. For example, the following text file:

**Example�1.13.�Incorrect groups file**

\[1\]
^aaa
^bbb

\[2\]
^ccc
^ddd

  

will generate the following regular expressions:

group 0: ((^aaa)|(^bbb))
group 1: ((^ccc)|(^ddd))

Note that the real index doesn't match the group number in the file. This is, compiled group 0 always points to the first group in the file, regardless of its number in the file. In fact, the group number appearing in the file is used for nothing but for delimiting different groups.

NOTE: A line containing a regular expression cannot start by '\[' since it would be treated as a new group. The same for lines starting by space, tab, or '#' (they would be ignored by the parser). As a workaround, using brackets would work:

\[0\]
(\[0-9\]{9})
( #abcde)
( qwerty)

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

17

15

117

38

2.

I�aki Baz Castillo

15

3

1242

2

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

10

25

42

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

9

6

63

88

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

8

6

12

7

6.

MonkeyTester

6

3

188

14

7.

Norman Brandinger ([@NormB](https://github.com/NormB))

5

3

4

4

8.

Steve Ayre

4

2

60

44

9.

Ken Rice

4

2

5

5

10.

Sergio Gutierrez

3

1

19

1

  

**All remaining contributors**: Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Anca Vamanu, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Marius Zbihlei.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Feb 2026

2.

Steve Ayre

Sep 2025 - Sep 2025

3.

Ken Rice

Sep 2025 - Sep 2025

4.

MonkeyTester

Aug 2023 - Aug 2023

5.

Norman Brandinger ([@NormB](https://github.com/NormB))

Apr 2023 - Apr 2023

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

8.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2009 - Apr 2019

9.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Nov 2018

10.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2013 - Jan 2013

  

**All remaining contributors**: Marius Zbihlei, I�aki Baz Castillo, Anca Vamanu, Sergio Gutierrez.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** MonkeyTester, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), I�aki Baz Castillo.

_Documentation Copyrights:_

Copyright � 2009 I�aki Baz Castillo