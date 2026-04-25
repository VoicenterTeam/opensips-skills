## 1.4.�Exported Functions

### 1.4.1.� `dialoginfo_set([side])`

This function must be called for INVITE messages that initialize a dialog for which dialoginfo information must be published.

Meaning of the parameters:

*   _side_ (string, optional) - can be "A" or/and "B" for caller or callee PUBLISH only - if missing, both sides will be published.
    

**Example�1.12.�`dialoginfo_set` usage**

...
	if(is\_method("INVITE"))
		if($ru =~ "opensips.org")
			dialoginfo\_set();
...
		

  

### 1.4.2.� `dialoginfo_set_branch_callee(callee)`

This function is to be used only from a branch route for setting a per-branch callee/peer specification. This peer value will be used onyl for the dialoginfo record created for that particular branch.

This function makes sense only in call forking (serial / parallel) scenarios, where a caller may be in relation with multiple different callees.

Meaning of the parameters:

*   _callee_ (string) - a SIP nams addr description of the callee (the name\_addr format is '\[display\] <uri>' or 'uri', as in the To or From headers)
    

**Example�1.13.�`dialoginfo_set_branch_callee` usage**

...
branch\_route\[out\]
{
....
	#align the published info with the RURI of the branch
	dialoginfo\_set\_branch\_callee("sip:$rU@opensips.org");
...
}
		

  

### 1.4.3.� `dialoginfo_mute_branch([side])`

This function must be called for INVITE messages, in the branch route only, in order to mute the publishing of the dialoginfo information for caller/callee/both parties involved in that branch.

Meaning of the parameters:

*   _side_ (string, optional) - can be "A" or/and "B" for caller or callee muting only - if missing, both sides will be muted.
    

**Example�1.14.�`dialoginfo_mute_branch` usage**

...
	branch\_route\[out\] {
		# mute publishing for callee side if not a local domain
		if (!is\_domain\_local("$rd"))
			dialoginfo\_mute\_branch("B");
	}
...