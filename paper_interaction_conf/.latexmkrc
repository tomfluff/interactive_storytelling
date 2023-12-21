#!/usr/bin/env perl
$latex = 'platex -synctex=1 -halt-on-error';
$latex_silent = 'platex -synctex=1 -halt-on-error -interaction=batchmode';
$bibtex = 'pbibtex -kanji=utf8';
$dvipdf = 'dvipdfmx %O -o %D %S';
$makeindex = 'mendex %O -o %D %S';
$max_repeat = 5;
$pdf_mode = 3; # 0: none, 1: pdflatex, 2: ps2pdf, 3: dvipdfmx
$aux_dir = ".";
$out_dir = ".";