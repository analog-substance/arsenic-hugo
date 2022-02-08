A quick summary of the general vulnerability. Reflected XSS vulnerabilities occur when request parameters are not properly neutralized before being rendered in a web page.

A detailed description of this specific instance of the vulnerability and its impact to the target. An unauthenticated actor can pass arbitrary JS in the `search` query parameter. The WebAppName web application renders this field directly in the search results header. A threat actor could use this in a phishing campaign to steal session cookies, or capture credentials.
