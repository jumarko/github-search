#!/bin/sh
if [ $# -lt 4 ] ; then
   echo "Please, enter organization name, user, password and query to be searched as a command line parameters!"
   exit 1;
fi
ORGANIZATION=$1
USER=$2
PASSWORD=$3
query=$4
echo "Searching for query=$query in all $ORGANIZATION repositories"
for repository in $(curl --user "$USER:$PASSWORD" https://api.github.com/orgs/$ORGANIZATION/repos | grep full_name | grep -o $ORGANIZATION[^\"]*) ; do
   echo "========================================================================"
   echo "Repository=$repository"
   curl --user "$USER:$PASSWORD" https://github.com/$repository/search?q=$query
   echo "========================================================================"
   echo "\n"
done
