var Atos;
(function (Atos) {
    var SharePoint;
    (function (SharePoint) {
        var ThemeManager = (function () {
            function ThemeManager(hostWebUrl, appWebUrl) {
                this.hostWebUrl = hostWebUrl;
                this.appWebUrl = appWebUrl;
            }
            ThemeManager.prototype.Provision = function () {
                var uploader = new SharePoint.Uploader(this.hostWebUrl, this.appWebUrl);
                var uploadFiles = new Array();
                uploadFiles.push(["/ThemeContent/css/atos.css", "/_catalogs/masterpage/Atos/atos.css"]);
                uploadFiles.push(["/ThemeContent/scripts/atos.js", "/_catalogs/masterpage/Atos/atos.js"]);
                uploadFiles.push(["/ThemeContent/fonts/stag-medium-webfont.eot", "/_catalogs/masterpage/Atos/fonts/stag-medium-webfont.eot"]);
                uploadFiles.push(["/ThemeContent/fonts/stag-medium-webfont.ttf", "/_catalogs/masterpage/Atos/fonts/stag-medium-webfont.ttf"]);
                uploadFiles.push(["/ThemeContent/fonts/stag-medium-webfont.woff", "/_catalogs/masterpage/Atos/fonts/stag-medium-webfont.woff"]);
                uploadFiles.push(["/ThemeContent/images/aeirial-view-of_traffic-and_overpasses.jpg", "/_catalogs/masterpage/Atos/images/aeirial-view-of_traffic-and_overpasses.jpg"]);
                uploadFiles.push(["/ThemeContent/images/atos_logo.gif", "/_catalogs/masterpage/Atos/images/atos_logo.gif"]);
                uploadFiles.push(["/ThemeContent/images/baseline.png", "/_catalogs/masterpage/Atos/images/baseline.png"]);
                uploadFiles.push(["/ThemeContent/images/grain-landscape.jpg", "/_catalogs/masterpage/Atos/images/grain-landscape.jpg"]);
                uploadFiles.push(["/ThemeContent/images/lifeguard-chair.jpg", "/_catalogs/masterpage/Atos/images/lifeguard-chair.jpg"]);
                uploadFiles.push(["/ThemeContent/images/man-walking-on-dessert-highway-1024.jpg", "/_catalogs/masterpage/Atos/images/man-walking-on-dessert-highway-1024.jpg"]);
                uploadFiles.push(["/ThemeContent/images/man-walking-on-dessert-highway.jpg", "/_catalogs/masterpage/Atos/images/man-walking-on-dessert-highway.jpg"]);
                uploadFiles.push(["/ThemeContent/images/manchester.jpg", "/_catalogs/masterpage/Atos/images/manchester.jpg"]);
                uploadFiles.push(["/ThemeContent/theme/Atos.spcolor", "/_catalogs/theme/15/Atos.spcolor"]);
                return uploader.UploadMany(uploadFiles);
            };
            ThemeManager.prototype.ApplyTheme = function () {
                var hostWebContext = new SP.ClientContext(SharePoint.Utils.getRelativeUrlFromAbsolute(this.hostWebUrl));
                var web = hostWebContext.get_web();
                var deferred = jQuery.Deferred();
                hostWebContext.load(web);
                hostWebContext.executeQueryAsync(function () {
                    var webRelativeUrl = web.get_serverRelativeUrl();
                    var themeUrl = webRelativeUrl + "/_catalogs/theme/15/Atos.spcolor";
                    var bgUrl = webRelativeUrl + "/_catalogs/masterpage/Atos/images/aeirial-view-of_traffic-and_overpasses.jpg";
                    var cssUrl = webRelativeUrl + "/_catalogs/masterpage/Atos/atos.css";
                    web.applyTheme(themeUrl, null, bgUrl, true);
                    web.update();
                    hostWebContext.executeQueryAsync(function () {
                        web.set_alternateCssUrl(cssUrl);
                        web.update();
                        hostWebContext.executeQueryAsync(function () {
                            deferred.resolve();
                        }, function (sender, args) {
                            deferred.reject("Setting alternate CSS failed: " + args.get_message());
                        });
                    }, function (sender, args) {
                        deferred.reject("Setting theme failed: " + args.get_message());
                    });
                }, function (sender, args) {
                    deferred.reject("Loading the host web context failed: " + args.get_message());
                });
                return deferred.promise();
            };
            return ThemeManager;
        }());
        SharePoint.ThemeManager = ThemeManager;
    })(SharePoint = Atos.SharePoint || (Atos.SharePoint = {}));
})(Atos || (Atos = {}));
