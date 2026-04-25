## 1.4.�Exported Functions

### 1.4.1.� `options_reply()`

This function checks if the request method is OPTIONS and if the request URI does not contain an username. If both is true the request will be answered stateless with “200 OK” and the capabilities from the modules parameters.

It sends “500 Server Internal Error” for some errors and returns false if it is called for a wrong request.

The check for the request method and the missing username is optional because it is also done by the function itself. But you should not call this function outside the myself check because in this case the function could answer OPTIONS requests which are sent to you as outbound proxy but with an other destination then your proxy (this check is currently missing in the function).

This function can be used from REQUEST\_ROUTE.

**Example�1.5.�`options_reply` usage**

...
if (is\_myself("$rd")) {
	if (is\_method("OPTIONS") && (! $ru=~"sip:.\*\[@\]+.\*")) {
		options\_reply();
	}
}
...