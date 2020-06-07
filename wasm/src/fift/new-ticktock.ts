/** @format */

export const newTicktock = `#!/usr/bin/fift -s
"TonUtil.fif" include
"Asm.fif" include

{ ."usage: " @' $0 type ." <workchain-id> [<filename-base>]" cr
  ."Creates a new wallet in specified workchain, with private key saved to or loaded from <filename-base>.pk" cr
  ."('new-wallet.pk' by default)" cr 1 halt
} : usage
$# 1- -2 and ' usage if

$1 parse-workchain-id =: wc    // set workchain id from command line argument
$2 constant file-base

// tock contract code

<{ SETCP0

  DUP 105222 INT EQUAL IF:<{
    c4 PUSHCTR CTOS 32 LDU 32 LDI DROP NOW
  }>ELSE<{
    c4 PUSHCTR CTOS 32 LDU DROP NOW LESS IF:<{
      ACCEPT
      3 INT NOW ADD NEWC 32 STU 32 STI ENDC c4 POPCTR
    }>
  }>

}>c

<b b{011111} s, swap ref, <b 0 32 u, 500 32 i, b> ref, null dict, b>  // create StateInit

dup ."StateInit: " <s csr. cr
dup hashu wc swap 2dup 2constant wallet_addr
."ticktock address = " 2dup .addr cr
2dup file-base +".addr" save-address-verbose
."Non-bounceable address (for init): " 2dup 7 .Addr cr
."Bounceable address (for later access): " 6 .Addr cr
<b b{1000100} s, wallet_addr addr, b{000010} s, swap <s s, b{0} s, b>
dup ."External message for initialization is " <s csr. cr
2 boc+>B dup Bx. cr
file-base +"-query.boc" tuck B>file
."(Saved ticktock creating query to file " type .")" cr
`
