/** @format */

export const testgiver = `#!/usr/bin/fift -s
"TonUtil.fif" include

{ ."usage: " @' $0 type ." <dest-addr> <seqno> <amount> [<savefile>]" cr
  ."Creates a request to TestGiver and saves it into <savefile>.boc" cr
  ."('testgiver-query.boc' by default)" cr 1 halt
} : usage

$# 3 - -2 and ' usage if

// "testgiver.addr" load-address 
Masterchain 0xfcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260
2constant giver_addr
 ."Test giver address = " giver_addr 2dup .addr cr 6 .Addr cr

$1 true parse-load-address =: bounce 2=: dest_addr
$2 parse-int =: seqno
$3 $>GR =: amount
def? $4 { @' $4 } { "testgiver-query" } cond constant savefile

."Requesting " amount .GR ."to account "
dest_addr 2dup bounce 7 + .Addr ." = " .addr
."seqno=0x" seqno x. ."bounce=" bounce . cr

// create a message (NB: 01b00.., b = bounce)
<b b{01} s, bounce 1 i, b{000100} s, dest_addr addr, 
   amount Gram, 0 9 64 32 + + 1+ 1+ u, 0 32 u, "GIFT" $, b>
<b seqno 32 u, 1 8 u, swap ref, b>
dup ."enveloping message: " <s csr. cr
<b b{1000100} s, giver_addr addr, 0 Gram, b{00} s,
   swap <s s, b>
dup ."resulting external message: " <s csr. cr
2 boc+>B dup Bx. cr
savefile +".boc" tuck B>file
."(Saved to file " type .")" cr
`
