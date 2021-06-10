#!/bin/bash

# $\displaystyle XXXXXXX$\bye

X=$(mktemp -d)
cat > $X/file.tex
latex -output-directory $X $X/file.tex &>/dev/null
dvisvgm --no-fonts -o $X/%f $X/file.dvi &>/dev/null
cat $X/file.svg
rm -rf $X
