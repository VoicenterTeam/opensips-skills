# Flags Reference
<!-- generated-from: data/3.6/core/flags.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: flag -->

Reference for OpenSIPs 3.6 message, branch, and script flags. Read this file when setting, clearing, or testing flags from script and need to confirm persistence scope and the available flag-manipulation functions.

## Contents

- [branch flags](#branch-flags)
- [message flags](#message-flags)

## branch flags

are saved also in transaction, but per branch; also they will be saved in usrloc (per contact). A new set of functions were added for manipulating these flags from script. So, there flags will be registration persistent and branch persistent.

- **Persistence:** registration persistent and branch persistent
- **Max flags:** 0

**Functions:**

- `isbflagset` — Check if a branch flag is set for a specific branch or default branch. Signature: `isbflagset(branch_idx, FLAG) or isbflagset(FLAG)`.
- `resetbflag` — Reset a branch flag for a specific branch or default branch. Signature: `resetbflag(branch_idx, FLAG) or resetbflag(FLAG)`.
- `setbflag` — Set a branch flag for a specific branch or default branch. Signature: `setbflag(branch_idx, FLAG) or setbflag(FLAG)`.

**Example.** Nat flag handling example.

```opensips_script
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
     ........
  }
}
```
## message flags

these flags are transaction persistent. They are visible in all routes and cases where the transaction context is visible

- **Persistence:** transaction persistent
- **Max flags:** 0

**Functions:**

- `isflagset` — Check if a message/transaction flag is set. Signature: `isflagset(FLAG)`.
- `resetflag` — Reset a message/transaction flag. Signature: `resetflag(FLAG)`.
- `setflag` — Set a message/transaction flag. Signature: `setflag(FLAG)`.

**Example.** Set flag by name.

```opensips_script
setflag(accounting)
```

**Example.** Reset flag by name.

```opensips_script
resetflag(DO_NAT)
```

**Example.** Set flag by index.

```opensips_script
setflag(19)
```
