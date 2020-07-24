# Markdown Server

Note this requires `cmark-gfm` to be in the PATH.

There's a bug when filenames are not properly escaped for bash strings. Right now, the filename is embedded in double quotes in a command line call. If the filename contains a double quote character, it will still break.
