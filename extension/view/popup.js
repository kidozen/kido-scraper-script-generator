    var token = localStorage.getItem('token');
    if (token)
        document.querySelector('pre').innerHTML = token;
    else {
        console.log('starting');
    	var tab,
            count   = 0,
            timeout = 60,
            prefix  = 'Success payload=';

        chrome.tabs.create({url: "https://auth-qa.kidozen.com/v1/armonia/sign-in?wtrealm=_marketplace&wreply=urn-ietf-wg-oauth-2.0-oob&wa=wsignin1.0"}, function (t) {
            tab = t;
        });
        function poll() {
            if ((tab && tab.title || '').indexOf(prefix) === 0) {
                var token = tab.title.substr(prefix.length);
                saveToken(token);
                return;
            }
            if (count > timeout) {
                alert('fail!');
                return;
            }
            count++;
            setInterval(poll, 1000);
        }
        poll();
        function saveToken(t) {
            localStorage.setItem('token', t);
        }
    }