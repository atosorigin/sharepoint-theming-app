'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

function initializePage() {
    var context = SP.ClientContext.get_current();
    var user = context.get_web().get_currentUser();

    var hostWebUrl: string;
    var appWebUrl: string;
    var manager: Atos.SharePoint.ThemeManager;

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(() => {
        $('[name="btnApplyStyle"]').on('click', applyStyling);

        // get the host web url from the URL vars
        var hostWebUrlFromQS = Atos.SharePoint.Utils.getUrlVar("SPHostUrl");
        hostWebUrl = (hostWebUrlFromQS !== undefined) ? decodeURIComponent(hostWebUrlFromQS) : undefined;

        // get the app web url from the URL vars
        var appWebUrlFromQS = Atos.SharePoint.Utils.getUrlVar("SPAppWebUrl");
        appWebUrl = (appWebUrlFromQS !== undefined) ? decodeURIComponent(appWebUrlFromQS) : undefined;
    });

    function addLog(message: string) {
        $('#themeLog').append(message + '<br/>');
    }

    function applyStyling() {
        var button = $('[name="btnApplyStyle"]');

        try {
            button.prop('disabled', true);

            addLog(`Applying Atos styling to ${hostWebUrl}.`);
            manager = new Atos.SharePoint.ThemeManager(hostWebUrl, appWebUrl);
            addLog(`Copying all style content (CSS / images / fonts).`);
            manager.Provision().then(() => {
                addLog(`Applying the theme to the site.`);
                return manager.ApplyTheme();
            }, () => {
                addLog(`Something went wrong copying theme content. You can try again or check the console log.`);
            }).then(() => {
                addLog("Success! The theme is now activated.");
            }, () => {
                addLog(`Something went applying the theme. You can try again or check the console log.`);
            });
        } finally {
            button.prop('disabled', false);
        }
    }
}
