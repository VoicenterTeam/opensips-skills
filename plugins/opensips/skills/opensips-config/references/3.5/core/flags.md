# Flags Reference
<!-- generated-from: data/3.5/core/flags.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: flag -->

Reference for OpenSIPs 3.5 message, branch, and script flags. Read this file when setting, clearing, or testing flags from script and need to confirm persistence scope and the available flag-manipulation functions.

## Contents

- [Branch flags](#branch-flags)
- [Message/transaction flags](#messagetransaction-flags)

## Branch flags

Saved in transaction, but per branch; also saved in usrloc (per contact). They show up in all routes where messages related to initial branch request are processed.

- **Persistence:** Registration persistent and branch persistent
- **Max flags:** 0

**Functions:**

- `isbflagset` — Checks if a branch flag is set for the default branch (branch 0).. Signature: `isbflagset(FLAG)`.
- `isbflagset / isbranchflagset` — Checks if a branch flag is set for a specific branch.. Signature: `isbflagset(branch_idx, FLAG) / isbranchflagset(branch_idx, FLAG)`.
- `resetbflag` — Resets a branch flag for the default branch (branch 0).. Signature: `resetbflag(FLAG)`.
- `resetbflag / resetbranchflag` — Resets a branch flag for a specific branch.. Signature: `resetbflag(branch_idx, FLAG) / resetbranchflag(branch_idx, FLAG)`.
- `setbflag` — Sets a branch flag for the default branch (branch 0).. Signature: `setbflag(FLAG)`.
- `setbflag / setbranchflag` — Sets a branch flag for a specific branch.. Signature: `setbflag(branch_idx, FLAG) / setbranchflag(branch_idx, FLAG)`.

**Example.** Nat flag handling using branch flags..

```opensips
 ..........
 # 3 - the nat flag
 modparam("usrloc", "nat_bflag", "NAT_BFLAG")
 ..........

 route {
   ..........
   if (nat detected)
      setbflag(NAT_BFLAG); # set branch flag "NAT_BFLAG" for the branch 0

   ..........
   if (is_method("REGISTER")) {
      # the branch flags (including "NAT_BFLAG") will be saved into location
      save("location");
      exit;
   } else {
      # lookup will load the branch flag from location
      if (!lookup("location")) {
         sl_send_reply("404","Not Found");
         exit;
      }
      t_on_branch("1")
      t_relay();
   }
 }

 branch_route[1] {
   xlog("-------branch=$T_branch_idx, branch flags=$bf\n");
   if (isbflagset(NAT_BFLAG)) {
      #current branch is marked as natted
      .........
   }
 }
```

**Example.** Checking branch flag without parallel forking..

```opensips
   ........
   if (isbflagset(NAT_BFLAG)) {
      #current branch is marked as natted
      .........
   }
   ......... 
```
## Message/transaction flags

These flags are transaction persistent. They are visible in all routes and cases where the transaction context is visible. They will show up in all routes where messages related to the initial request are processed (onbranch, failure, onreply, and all branch routes).

- **Persistence:** Transaction persistent
- **Max flags:** 0

**Functions:**

- `isflagset` — Checks if a message/transaction flag is set.. Signature: `isflagset(FLAG)`.
- `resetflag` — Resets a message/transaction flag.. Signature: `resetflag(FLAG)`.
- `setflag` — Sets a message/transaction flag.. Signature: `setflag(FLAG)`.

**Example.** Examples of setting and resetting message/transaction flags..

```opensips
setflag(accounting)
resetflag(DO_NAT)
setflag(19)
```
