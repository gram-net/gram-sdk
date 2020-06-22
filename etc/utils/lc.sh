TMP_DIR="${PROFILE}/tmp"
cd $TMP_DIR
LC_OUTPUTNAME=${ARG1}-${ARG2}-${ARG3}-${ARG4}-${ARG5}-${ARG6}
LC_COMMAND="${ARG1} ${ARG2} ${ARG3} ${ARG4} ${ARG5} ${ARG6}"
echo $LC_COMMAND
rm -f "${TMP_DIR}/${LC_OUTPUTNAME}*" || :
awk -v LC_OUTPUTNAME="${LC_OUTPUTNAME}" -v LC_COMMAND="${LC_COMMAND}" -v TMP_DIR="${TMP_DIR}" -v LS_PUB="${LS_PUB}" -v GRAM_IP="${GRAM_IP}" -v LITESERVER_PORT="${LITESERVER_PORT}" '{
  printf "lite-client --verbosity 9 -p " LS_PUB " -a " GRAM_IP ":" LITESERVER_PORT " -rc \"" LC_COMMAND "\" -rc \"quit\" &> " TMP_DIR "/" LC_OUTPUTNAME
}' "${PROFILE}/keys/liteserver.out" >"${TMP_DIR}/${LC_OUTPUTNAME}.sh"
cat "${TMP_DIR}/${LC_OUTPUTNAME}.sh"
echo -e "\nexecuting lite client"
bash "${TMP_DIR}/${LC_OUTPUTNAME}.sh"
export LCRES=$(cat ${TMP_DIR}/${LC_OUTPUTNAME})
grep result: $TMP_DIR/${LC_OUTPUTNAME} >$TMP_DIR/${LC_OUTPUTNAME}-
echo "--raw result--:"
cat $TMP_DIR/${LC_OUTPUTNAME}-
sed -i'' -e "s/[^0-9]//g" $TMP_DIR/${LC_OUTPUTNAME}-
echo "--trimmed result--:"
cat $TMP_DIR/${LC_OUTPUTNAME}-
export LCRES_FINAL=$(cat $TMP_DIR/${LC_OUTPUTNAME}-)
