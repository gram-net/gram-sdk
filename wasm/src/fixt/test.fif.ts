/** @format */

export const testfif = `#!/usr/bin/fift -s
"TonUtil.fif" include
"Asm.fif" include

PROGRAM{
  DECLPROC do_something
  DECLPROC recv_internal
  DECLPROC recv_external
  85143 DECLMETHOD seqno
  do_something PROC:<{
    DROP
    1 PUSHINT
    NEWC
    32 STU
    ENDC
    c4 POP
    1 PUSHINT
  }>
  recv_internal PROC:<{
    do_something CALLDICT
    DROP
  }>
  recv_external PROC:<{
    DROP
  }>
  seqno PROC:<{
    1548845 PUSHINT
  }>
}END>c <s csr.`
