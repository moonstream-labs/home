#!/bin/bash

# Declare a variable for the custom commit message
commit_message="$1"

# Check if the commit_message variable is empty
if [ -z "$commit_message" ]; then
  echo "Please provide a commit message."
  exit 1
fi

# Run the nue build command
nue build -r labs --production

# Add all changes to the staging area
git add -A

# Commit the changes with the custom commit message
git commit -m "$commit_message"

# Push the changes to the remote repository
git push