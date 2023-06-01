#!/bin/bash
pushd /srv/muzik/muzik
while true; do

    #Apply any updates
    echo "[+] Checking and Downloading Git Updates..."
    git stash
    git fetch --all
    git reset --hard origin/main
    git stash pop
    git pull
    echo "[+] Done."

    #Start the muzik
    echo $'[+] Starting Service...\n'
    (node ./muzik/app.js) &> muzik.latest.log
    /usr/bin/date >> muzik.latest.log
    mv muzik.latest.log muzik.log

    #Crashed record and restart
    TIME=$( date '+%F_%H:%M:%S' )
    echo $'\n----------------------------------'
    echo "[-] $TIME Application Crashed, Restarting..."
    echo $'----------------------------------\n'
    sleep 1
done
popd