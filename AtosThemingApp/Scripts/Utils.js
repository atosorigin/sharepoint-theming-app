var Atos;
(function (Atos) {
    var SharePoint;
    (function (SharePoint) {
        var Utils = (function () {
            function Utils() {
            }
            Utils.getUrlVar = function (name) {
                var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                if (results == null) {
                    return null;
                }
                else {
                    return results[1] || "";
                }
            };
            Utils.appendPath = function (path, appendWith) {
                if (path.endsWith('/'))
                    return path + appendWith;
                else
                    return path + '/' + appendWith;
            };
            Utils.getRelativeUrlFromAbsolute = function (absoluteUrl) {
                absoluteUrl = absoluteUrl.replace('https://', '');
                var parts = absoluteUrl.split('/');
                var relativeUrl = '/';
                for (var i = 1; i < parts.length; i++) {
                    relativeUrl += parts[i] + '/';
                }
                return relativeUrl;
            };
            Utils.getFilenameFromUrl = function (url) {
                var filename = url.substring(url.lastIndexOf('/') + 1);
                return filename;
            };
            Utils.getPathFromUrl = function (url) {
                var path = url.substring(1, url.lastIndexOf('/') + 1);
                return path;
            };
            Utils.arrayBufferToBase64 = function (buffer) {
                var binary = '';
                var bytes = new Uint8Array(buffer);
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                var result = new SP.Base64EncodedByteArray(window.btoa(binary));
                return result;
            };
            return Utils;
        }());
        SharePoint.Utils = Utils;
    })(SharePoint = Atos.SharePoint || (Atos.SharePoint = {}));
})(Atos || (Atos = {}));
