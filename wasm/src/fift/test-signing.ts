/** @format */

export const testSigning = `#!/usr/bin/fift -s
"TonUtil.fif" include
"Asm.fif" include

$1 constant wc
$2 constant base
base +".sk" load-generate-keypair constant seckey constant pubkey
<b 0 32 u, b>
hashB dup constant hash
seckey
ed25519_sign constant sig
."wc: " wc type cr
."base: " base type cr
."seckey: " seckey Bx. cr
."pubkey: " pubkey Bx. cr
."hash: " hash Bx. cr
."sig: " sig Bx. cr
."stack: " .s
pubkey base +".pk" B>file
hash base +".hash" B>file
sig base +".sig" B>file`
