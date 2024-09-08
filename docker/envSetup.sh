#!/bin/sh
cp /usr/share/nginx/html/static/config.json /usr/share/nginx/html/static/config.json.og
jq -s '. | add ' /usr/share/nginx/html/static/config.json.og <(
env | grep "AKKOMACONFIG__" | sed s/AKKOMACONFIG__//g | tr '[:upper:]' '[:lower:]' | jq -nR '
  def trim: sub("^ +";"") | sub(" +$";"");
  [inputs
   | select(index("="))
   | sub("\r$"; "")
   | capture( "(?<key>[^=]*)=(?<value>.*)" )
   | ( (.key |= trim) | (.value |= trim)) ]
  | from_entries'
) > /usr/share/nginx/html/static/config.json
