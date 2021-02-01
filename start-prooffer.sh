#!/bin/bash
set -e
LOGFILE=/var/log/gunicorn/prooffer.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=3
USER=root
cd /home/rafael/prooffer
test -d $LOGDIR || mkdir -p $LOGDIR
exec /usr/local/bin/gunicorn_django -b 127.0.0.1:7708  -w $NUM_WORKERS --user=$USER --log-file=$LOGFILE 2>>$LOGFILE --timeout 500
