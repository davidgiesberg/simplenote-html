# simplenote-html

simplenote-html is a <b>read-only</b> HTML/JavaScript client for
<a href="http://simplenoteapp.com/">simplenote</a>, written because I wanted
to be able to read my notes on my Android phone, and I couldn't be bothered to
write a real Java application for it. It stores the contents of your notes in
local storage, so it's fast, and it'll poll for changes, and once I get the
manifest working it'll work offline and be bookmarkable on your iphone home
screen if you're into that sort of thing.

Caveats - <b>it's experimental</b>. It's read-only - you can't change notes
yet, this represents an afternoon of work, not a real project. I don't
really care about the ability to edit notes, 80% of my use case is
just reading things I've written on the desktop.

Most importantly, because of HTML and cross-domain stuff being what it
is, <b>all requests made my this app go through proxy.php</b>, and it proxies
them to the simplenote server. This means that (a) It might be logging your
password (it doesn't, but your users can't prove that), and (b) it all goes
over HTTP unless you have an HTTPS certificate, so someone else can sniff your
password.

DO NOT USE IT IF YOU CARE ABOUT THIS.



## TODO

* poll for updates every 5 mins while the app is running
* better 'back' icon for note view
* credit icon sources
