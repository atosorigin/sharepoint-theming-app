namespace Atos.SharePoint {
    export class Utils {

        static getUrlVar(name: string): string {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (results == null) {
                return null;
            }
            else {
                return results[1] || "";
            }
        }

        static appendPath(path: string, appendWith: string): string {
            if (path.endsWith('/'))
                return path + appendWith;
            else
                return path + '/' + appendWith;
        }

        static getRelativeUrlFromAbsolute(absoluteUrl: string): string {
            absoluteUrl = absoluteUrl.replace('https://', '');

            var parts = absoluteUrl.split('/');
            var relativeUrl = '/';

            for (var i = 1; i < parts.length; i++) {
                relativeUrl += parts[i] + '/';
            }

            return relativeUrl;
        }

        static getFilenameFromUrl(url: string): string {
            var filename = url.substring(url.lastIndexOf('/') + 1);
            return filename;
        }

        static getPathFromUrl(url: string): string {
            var path = url.substring(1, url.lastIndexOf('/') + 1);
            return path;
        }

        static arrayBufferToBase64(buffer: number): SP.Base64EncodedByteArray {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            var result = new SP.Base64EncodedByteArray(window.btoa(binary));
            return result;
        } 
    }
}