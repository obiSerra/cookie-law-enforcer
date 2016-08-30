(function () {
    /**
     *
     * @param privacyLink String The url of the privacy policy page. Required
     * @param bannerOptions Object The banner related configurations
     *                              bannerMsg:      String, the disclaimer text
     *                              bannerStyle:    Object, an hashmap with css rules. {'rule-name': 'rule value'}.
     *                                              null if external css is provided
     *                              linkStyle:      Object, an hashmap with css rules for privacy link.
     *                                              null if external css is provided
     *                              buttonStyle:    Object, an hashmap with css rules for the Ok button
     *                                              null if external css is provided
     * @param cookieOptions Object The cookie related configurations
     *                              cookieName:     String, the name of the privacy cookie. Default: acceptCookies
     *                              expires:        String, expiration date. Default: +1 year
     *                              maxAge:         Number, the cookie duration. Default: 60*60*24*365
     * @param scrollDistance Number The required amount of scroll to be accepted
     *
     * @constructor
     */
    function CookieLawEnforcer (privacyLink, bannerOptions, cookieOptions, scrollDistance) {

        // Dataproofing
        if (!privacyLink) { // -- TODO Migliorare messaggio di errore
            throw new Error ('Inserire un link alla pagina della privacy');
        }

        cookieOptions = cookieOptions || {};
        bannerOptions = bannerOptions || {};

        // Private properties
        var scrollStart = null;

        // Private methods

        function addOneYear () {
            var today = new Date();
            return new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        }

        function checkCookie (cName) {
            return document.cookie.split(";").filter(function (c) {
                    return c.indexOf(cName) > -1;
                }).length > 0;
        }

        function generateCookieStr (name, maxAge, expires) {
            return encodeURIComponent(name) + '=true' +
                ';max-age=' + maxAge +
                ';expires=' + expires +
                ';path=/';
        }

        function saveCookie (cookie) {
            document.cookie = cookie;
        }

        function userAccept (cName, maxAge, expires) {
            var cookie = generateCookieStr(cName, maxAge, expires);
            saveCookie(cookie);

            window.location.reload();
        }

        function scaffoldingBannerStyle (styleObj) {
            if (!styleObj.color) {
                styleObj.color = '#fff';
            }

            if (!styleObj['background-color']) {
                styleObj['background-color'] = '#999';
            }

            if (!styleObj['text-align']) {
                styleObj['text-align'] = 'center';
            }

            if (!styleObj['padding']) {
                styleObj['padding'] = '5px';
            }

            if (!styleObj['position']) {
                styleObj['position'] = 'fixed';
            }

            if (!styleObj['top']) {
                styleObj['top'] = '0';
            }

            return styleObj;
        }

        function scaffoldingLinkStyle (styleObj) {
            if (!styleObj.color) {
                styleObj.color = '#fff';
            }

            if (!styleObj['font-weight']) {
                styleObj['font-weight'] = 'bold';
            }

            return styleObj;
        }

        function scaffoldingButtonStyle (styleObj) {
            if (!styleObj['background-color']) {
                styleObj['background-color'] = '#000';
            }

            if (!styleObj['color']) {
                styleObj['color'] = '#fff';
            }

            if (!styleObj['border']) {
                styleObj['border'] = 'none';
            }

            return styleObj;
        }

        function convertStyleToStr (styleObj) {
            var str = '',
                prop;

            for (prop in styleObj) {
                if (styleObj.hasOwnProperty(prop)) {
                    str += prop + ': ' + styleObj[prop] + ';';
                }
            }

            return str;
        }

        function generateStyle (bannerStyle, linkStyle, buttonStyle) {
            var $style;

            $style = document.createElement('style');
            $style.innerText = '';

            if (bannerStyle !== null) {
                bannerStyle = scaffoldingBannerStyle(bannerStyle);
                $style.innerText = '#cookie-law-banner {' + convertStyleToStr(bannerStyle) + '}';
            }

            if (linkStyle !== null) {
                linkStyle = scaffoldingLinkStyle(linkStyle);
                $style.innerText += '#cookie-law-banner a {' + convertStyleToStr(linkStyle) + '}';
            }

            if (buttonStyle !== null) {
                buttonStyle = scaffoldingButtonStyle(buttonStyle);
                $style.innerText += '#cookie-law-banner button.accept-cookies {' + convertStyleToStr(buttonStyle) + '}';
            }

            return $style;
        }

        function generateBanner (privacyLink, bannerMsg) {

            bannerMsg = bannerMsg || 'Questo sito utilizza anche cookie di profilazione per inviarti ' +
                'pubblicit&agrave; e servizi in linea con le tue preferenze. Se vuoi saperne di pi&ugrave; o ' +
                'negare il consenso a tutti o ad alcuni cookie ' +
                '<a href="' + privacyLink + '" target="_blank" title="Privacy policy">clicca qui</a>.<br>' +
                'Proseguendo con la navigazione acconsenti all\'uso dei cookie.&nbsp;' +
                '<button type="button" class="accept-cookies">Ok</button>';

            var $bannerNode = document.createElement('div'),
                bannerWrapper = '<div id="cookie-law-banner">' + bannerMsg + '</div>';

            $bannerNode.innerHTML = bannerWrapper;

            return $bannerNode;
        }

        function appendBanner (bannerEl) {
            document.body.appendChild(bannerEl);
        }

        function appendStyle (styleEl) {
            if (styleEl.innerText !== '') {
                document.head.appendChild(styleEl);
            }
        }

        function recordScroll () {
            scrollStart = getTopOffset();
        }

        function checkAcceptByScroll (delta, callback) {
            if (scrollStart !== null && Math.abs(scrollStart - getTopOffset()) > delta) {

                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        }

        function singleAttachEvent(el, type, handler) {
            if (el.attachEvent) {
                el.attachEvent('on'+type, handler);
            }
            else {
                el.addEventListener(type, handler);
            }
        }

        // Helper
        function addEvent(el, type, handler) {
            if (el.length > 0) {
                [].slice.call(el).forEach(function (e) {
                    singleAttachEvent(e, type, handler);
                });
            } else {
                singleAttachEvent(el, type, handler);
            }


        }

        function getTopOffset () {
            return document.documentElement.scrollTop || document.body.scrollTop;
        }

        // Public props

        this.cookieName = cookieOptions.name || 'cookielaw-acpt';
        this.expires = cookieOptions.expires || addOneYear();
        this.maxAge = cookieOptions.maxAge || 60*60*24*365;
        this.privacyLink = privacyLink;
        this.bannerMsg = bannerOptions.bannerMsg || null;
        this.bannerStyle  = (typeof bannerOptions.bannerStyle  === 'undefined') ? {} : bannerOptions.bannerStyle;
        this.linkStyle = (typeof bannerOptions.linkStyle  === 'undefined') ? {} : bannerOptions.linkStyle;
        this.buttonStyle = (typeof bannerOptions.buttonStyle  === 'undefined') ? {} : bannerOptions.buttonStyle;
        this.scrollDistance = scrollDistance || 100;

        // Public methods

        this.init = function () {
            var $banner,
                $style,
                button;

            if (!checkCookie(this.cookieName)) {

                $banner = generateBanner(this.privacyLink, this.bannerMsg);
                button = $banner.querySelectorAll('button');
                $style = generateStyle(this.bannerStyle, this.linkStyle, this.buttonStyle);
                appendStyle($style);
                appendBanner($banner);

                addEvent(button, 'click', function () {
                    userAccept(this.cookieName, this.maxAge, this.expires);
                }.bind(this));

                addEvent(document, 'scroll', function () {
                    if (scrollStart === null) {
                        recordScroll();
                    }
                    checkAcceptByScroll(this.scrollDistance, function () {
                        userAccept(this.cookieName, this.maxAge, this.expires);
                    }.bind(this));
                }.bind(this));
            }
        };
    }
    // set global
    window.CookieLawEnforcer = CookieLawEnforcer;
} ());