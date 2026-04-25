## 1.7.�Exported Functions

### 1.7.1.� `send_smpp_message(smsc_name, [from],[to],[body],[utf-16],[delivery_receipt])`

This function is used to convert a SIP message received in the OpenSIPS script to a SMPP PDU and send it to the _smsc\_name (string)_ received as parameter. The SMPP parameters used to construct the PDU are provisione in the database, and the command sent is either _submit\_sm_ or _deliver\_sm_, depending on the type of the SMSc.

The function returns _\-2_ if the SMSc the message should be sent does not exist in the database, _\-1_ if there was an internal error, or positive value in case of success.

Meaning of the parameters is as follows:

*   _sms\_name (string)_ - name of the SMS to be used for sending the SMPP traffic.
    
*   _from (string, optional)_ - the source number. If missing, the SIP message from username is used.
    
*   _to (string, optional)_ - the destination number. If missing, the SIP request URI username is used.
    
*   _body (string, optional)_ - the body of the SMS. If missing, the SIP message body is used.
    
*   _UTF-16 (int, optional)_ - set to _1_ if the body of the message is in UTF-16. format. If missing or _0_, UTF-8 is used.
    
*   _delivery\_receipt (int, optional)_ - Whether the SMSC should confirm delivery for this SMS or not
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE or BRANCH\_ROUTE.

**Example�1.18.�`send_smpp_message()` usage**

...
    if (is\_method("MESSAGE"))
			send\_smpp\_message("MY\_SMSC");
...