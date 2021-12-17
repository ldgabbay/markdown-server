#!/bin/bash

X=$(mktemp -d)
cat > $X/file.tex
latex -output-directory $X $X/file.tex &>/dev/null
dvisvgm --no-fonts -Z 1.5 -o $X/%f $X/file.dvi &>/dev/null
cat $X/file.svg
rm -rf $X
