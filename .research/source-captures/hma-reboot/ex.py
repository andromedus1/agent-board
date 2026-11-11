import sys,re,html
f=sys.argv[1]
t=open(f+'.html',errors='ignore').read()
t=re.sub(r'(?s)<(script|style|noscript)[^>]*>.*?</\1>','',t)
t=re.sub(r'<(br|/p|/li|/h\d|/div|/tr)[^>]*>','\n',t)
t=html.unescape(re.sub(r'<[^>]+>','',t))
L=[l.strip() for l in t.split('\n') if l.strip()]
open(f+'.txt','w').write('\n'.join(L))
# main article: last Published Date window
p=[i for i,l in enumerate(L) if 'Published Date' in l or 'Apple Footer' in l]
end=p[0] if p else len(L)
# start = first line after the last long TOC run: use title index
title=L[0]
print('\n'.join(l[:1500] for l in L[max(0,end-int(sys.argv[2])):end+1]))
