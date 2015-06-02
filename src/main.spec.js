describe('cookie law enforcer', function () {
    var cookieSpy,
        getCookieSpy,
        setCookieSpy,
        cookie;

    beforeEach(function () {
        setCookieSpy = jasmine.createSpy('setCookie').and.callFake(function (v) {
            cookie += (cookie) ? cookie + ';' : v;
        });

        getCookieSpy = jasmine.createSpy('getCookie').and.callFake(function () {
            return cookie;
        });

        cookieSpy = spyOn(document, 'cookie').and.callFake((function () {

            var d = document;

            d.__defineSetter__('cookie', setCookieSpy);

            d.__defineGetter__('cookie', getCookieSpy);

            return d;
        }()));


        document.body.innerHTML = '';
        cookie = '';
    });

    describe('basic test', function () {

        it('should check if cookie is already set', function () {
            var cle = new CookieLawEnforcer('#');
            cle.init();

            expect(getCookieSpy).toHaveBeenCalled();
            expect(getCookieSpy.calls.count()).toEqual(1);
        });


        it('should generate the banner if the cookie is not saved', function () {
            var domEl,
                cle = new CookieLawEnforcer('#');
            cle.init();

            domEl = document.getElementById('cookie-law-banner');
            expect(domEl).not.toBeNull();
        });

        it('should understand a click on ok-button as policy accepted', function () {
            var cle = new CookieLawEnforcer('#');

            cle.init();

            document.querySelectorAll('button')[0].click();

            expect(setCookieSpy.calls.count()).toEqual(1);
            expect(cookie).not.toEqual('');
        });
        //
        //it('should understand a scroll-down as policy accepted', function () {
        //
        //});
        //
        //it('should save a cookie when user accept the policy', function () {
        //
        //});
        //
        //it('should do nothing when the cookie is already saved', function () {
        //    var cle = new CookieLawEnforcer('#');
        //
        //    cookie = 'cookielaw-acpt';
        //
        //    cle.init();
        //
        //    domEl = document.getElementById('cookie-law-banner');
        //    expect(domEl).toBeNull();
        //});
        //
        //it('should throw when no policy url is passed in', function () {
        //
        //});
        //
        //it('should open a link in an new tab when a user clicks on the privacy link', function () {
        //
        //});
    });

    describe('optional parameters', function () {
       //--
    });




    //it('should save a cookie if there is no one', function () {
    //    var cle = new CookieLawEnforcer('#');
    //    cle.init();
    //
    //    expect(document.cookie).not.toEqual('');
    //});
});