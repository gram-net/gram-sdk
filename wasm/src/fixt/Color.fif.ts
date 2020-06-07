/** @format */

export const ColorFif = `library Color
{ 27 emit } : esc

{ char " word 27 chr swap $+ 1 ' type does create } :_ make-esc"

make-esc"[0m" ^reset

make-esc"[30m" ^black

make-esc"[31m" ^red

make-esc"[32m" ^green
make-esc"[33m" ^yellow
make-esc"[34m" ^blue
make-esc"[35m" ^magenta
make-esc"[36m" ^cyan
make-esc"[37m" ^white

// bold
make-esc"[30;1m" ^Black
make-esc"[31;1m" ^Red
make-esc"[32;1m" ^Green
make-esc"[33;1m" ^Yellow
make-esc"[34;1m" ^Blue
make-esc"[35;1m" ^Magenta
make-esc"[36;1m" ^Cyan
make-esc"[37;1m" ^White
`
