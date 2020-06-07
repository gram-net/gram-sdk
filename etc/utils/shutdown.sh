if ! [ -n "$GRAMCLI" ]; then
  echo "Run scripts using 'gram \$command'"; gram help
  exit 1
fi
docker-compose down || : 
docker-compose rm || : 
gram deploystack Shutdown docker-compose.yml || : 
pm2 stop gram || : 
ec "Shutdown complete";
