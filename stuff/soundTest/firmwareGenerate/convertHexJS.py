#!/usr/bin/python

import sys

if len(sys.argv)<2:
    print("need file argument")
    exit(-1)
    
fReadHex = open(sys.argv[1], "r")
hexContent = fReadHex.read()
hexContentEscapeNewline = '\\n'.join(hexContent.splitlines())

jsContent = "var hexContent = \""+hexContentEscapeNewline+"\";"
#print(jsContent)
 
hexJsFileName = sys.argv[1].replace('.','_')+".js"
#print(hexJsFileName)
fWriteJs = open(hexJsFileName, "w")
fWriteJs.write(jsContent)
fWriteJs.close()
