## 1.7.�Exported Pseudo-Variables

### 1.7.1.�`$keepalive.socket(nat_endpoint)`

Returns the local socket used to send messages to the given NAT endpoint URI. The socket has the form proto:ip:port. The NAT endpoint URI is in the form: sip:ip:port\[;transport=xxx\] with transport missing if UDP. If the requested NAT endpoint URI is present in the internal keepalive table for any condition, it will return its associated local socket, else it will return null. The nat\_endpoint can be a string or another pseudo-variable.

This can be useful to restore the sending socket when relaying messages to a given user agent in multi-proxy environments. Consider an example where 2 proxies are involved, P1 and P2. A user agent registers by sending a REGISTER request to P1. P1 will call nat\_keepalive() but because it determines that P2 should actually handle the user registration will forward the request to P2. Now assume P2 receives an incoming INVITE for this user. It will determine that the registration came through P1 and will forward the request to P1. P2 should also include the NAT endpoint URI where this request is to be relayed. This information should have been provided by P1 when it relayed the REGISTER request to P2. The means to do this is out of the scope of this example, but one can either use the path extension or custom headers to do this. When P1 receives the INVITE it will use the NAT endpoint URI it has received along with the request to determine the socket to send out the request, which should be the same as the one where the registration request was originally received. In the example below lets assume that P2 provided the original NAT endpoint address in a custom header called X-NAT-URI and that it also provides a custom header called X-Scope to indicate that the message is sent to P1 for being relayed back to the user agent by P1 which has the NAT open with it.

**Example�1.11.�Using `$keepalive.socket` in multi-proxy environments**

...
# This code runs on P1 which has received an INVITE from P2 to forward
# it to the user agent behind NAT (because P1 has the NAT open with it).
if ($rm=="INVITE" && $hdr(X-Scope)=="nat-relay") {
    $du = $hdr(X-NAT-URI);
    $fs = $keepalive.socket($du);
    t\_relay();
    exit;
}
...
        

  

### 1.7.2.�`$source_uri`

Returns the URI specification from where a request was received in the form sip:ip:port\[;transport=xxx\] with transport missing if UDP.

This pseudo-variable can be used to set the received AVP for the registrar module to indicate that a user agent is behind NAT. This is meant as a more flexible replacement for the fix\_nated\_register() function, because it allows one to modify the source uri by appending some extra parameters before saving it to the received AVP.

Another use for this pseudo-variable is in multi-proxy environments to indicate the NAT endpoint URI to the next proxy (if needed). Consider the previous example with two proxies P1 and P2. P1 receives the REGISTER request from a user agent and forwards it to P2 which does the actual registration. P1 needs to indicate the NAT endpoint URI to P2, so that P2 can include it later for incoming INVITE requests to this user agent.

**Example�1.12.�Using `$source_uri` to set the received AVP on registrars**

...
modparam("registrar", "received\_avp", "$avp(received\_uri)")
modparam("registrar", "tcp\_persistent\_flag", 10)
...
# This code runs on the registrar, assuming it has received the
# REGISTER request directly from the user agent.
if ($rm=="REGISTER") {
    if (client\_nat\_test(3)) {
        if ($socket\_in(proto)==UDP) {
            nat\_keepalive();
        } else {
            # Keep TCP/TLS connections open until the registration
            # expires, by setting the tcp\_persistent\_flag
            setflag(10);
        }
        force\_rport();
        $avp(received\_uri) = $source\_uri;
        # or we could add some extra parameters to it if needed
        # $avp(received\_uri) = $source\_uri + ";relayed=false" 
    }
    if (!www\_authorize("", "subscriber")) {
        www\_challenge("", "0");
        return;
    } else if ($au!=$tU) {
        sl\_send\_reply("403", "Username!=To not allowed ($au!=$tU)");
        return;
    }

    if (!save("location")) {
        sl\_reply\_error();
    }
    exit;
}
...
        

  

**Example�1.13.�Using `$source_uri` in multi-proxy environments**

...
# This code runs on P1 which received the REGISTER request and has to
# forward it to the registrar P2.
if ($rm=="REGISTER") {
    if (client\_nat\_test(3)) {
        force\_rport();
        nat\_keepalive();
        append\_hf("X-NAT-URI: $source\_uri\\r\\n");
    }
    $du = "sip:P2\_ip:P2\_port";
    t\_relay();
    exit;
}
...
        

  

### 1.7.3.�`$nat_traversal.track_dialog`

Returns a boolean value (0 or 1) indicating if dialog tracking will be enabled by the nat\_traversal module. The nat\_traversal module will always track the dialog (by calling create\_dialog internally) unless told otherwise.

This is an advanced setting which is only meant to be used by multi-proxy setups where a proxy doesn't want to keep track of a dialog, that is, if it won't stay in the signaling path.

By setting this pv to 0 the nat\_traversal module will not attempt to create the dialog.