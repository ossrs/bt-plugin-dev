#!/bin/bash

# See https://www.bt.cn/bbs/thread-20376-1-1.html
# See https://www.bt.cn/data/api-doc.pdf
if [[ -z $BT_KEY ]]; then echo "No BT_KEY"; exit 1; fi

request_time=$(date +%s)
sk_md5=$(echo -n $BT_KEY |md5sum |awk '{print $1}')
request_token=$(echo -n "${request_time}${sk_md5}" |md5sum |awk '{print $1}')
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" \
    -d "request_time=$request_time&request_token=$request_token" \
    "http://localhost:7800/site?action=GetPHPVersion"
echo ""
