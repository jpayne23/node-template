# Notes on the build_run_local.sh script

Before running the script edit the `dockerenv.vars` file to include the names of any environment variables that the running service needs.
These will then be passed into the `docker run` command that the script executes.
The values for those variables are whatever you have in your shell environment when you start the script.
Typically those values will be set by the .envrc and .secret files.
