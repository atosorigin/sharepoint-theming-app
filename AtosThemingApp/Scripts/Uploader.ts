namespace Atos.SharePoint {

    enum Status {
        ERROR,
        WARNING,
        SUCCESS
    }

    export type IUploadTarget = [string, string];

    export class Uploader {
        hostWebContext: SP.ClientContext;

        constructor(private hostWebUrl: string, private appWebUrl: string) {

        }

        UploadMany(targets: IUploadTarget[]): JQueryPromise<void[]> {
            var promises: JQueryPromise<void>[];
            promises = [];

            for (var target of targets) {
                promises.push(this.Upload(target[0], target[1]));
            }

            return $.when.apply($, promises);
        }

        Upload(sourcePath: string, targetPath: string): JQueryPromise<void> {

            var deferred: JQueryDeferred<void> = jQuery.Deferred<void>();

            this.hostWebContext = new SP.ClientContext(Utils.getRelativeUrlFromAbsolute(this.hostWebUrl));
            var web = this.hostWebContext.get_web();

            this.hostWebContext.load(web);
            this.hostWebContext.executeQueryAsync(
                // in case of success
                () => {
                    console.log("Host Web successfully loaded");

                    var sourceFile = this.appWebUrl + sourcePath;
                    //logMessage("Reading file from App Web <a href='" + sourceFile + "' target='_blank'>" + sourcePath + "</a><br /><br />", state.SUCCESS);
                    //logMessage("<img src='" + sourceFile + "'><br />");
                    // Read file from app web
                    $.ajax(<JQueryAjaxSettings>{
                        url: sourceFile,
                        type: "GET",
                        dataType: "binary",
                        processData: false,
                        responseType: 'arraybuffer',
                        cache: false
                    }).done((contents: number) => {

                        var fileName: string = Utils.getFilenameFromUrl(targetPath);
                        var folder: string = Utils.getPathFromUrl(targetPath);

                        //logMessage("Create file at<br>    " + hostWebUrl + "/" + folder + fileName, state.SUCCESS);

                        // Create new file
                        var createInfo = new SP.FileCreationInformation();

                        // Convert ArrayBuffer to Base64 string
                        createInfo.set_content(Utils.arrayBufferToBase64(contents));

                        // Overwrite if already exists
                        createInfo.set_overwrite(true);

                        // set target url
                        createInfo.set_url(fileName);

                        var targetFolder = Utils.getRelativeUrlFromAbsolute(this.hostWebUrl) + folder;

                        // ensure the target folder has been created 
                        this.ensureTargetFolder(Utils.getRelativeUrlFromAbsolute(this.hostWebUrl), folder).then((folder) => {
                            // retrieve file collection of folder
                            var files = folder.get_files();

                            // load file collection from host web
                            this.hostWebContext.load(files);

                            // add the new file
                            files.add(createInfo);

                            // upload file
                            this.hostWebContext.executeQueryAsync(() => {

                                deferred.resolve();

                                var loadImage = this.hostWebUrl + "/" + folder + fileName;
                                //logMessage("File uploaded succeeded", state.SUCCESS);
                                //logMessage("<b>Try to embed file from host web</b><br><br>", state.SUCCESS);
                                //logMessage("<img src='" + loadImage + "'>", state.SUCCESS);
                                //logMessage("<a href='" + loadImage + "' target='_blank'>" + folder + fileName + "</a>", state.SUCCESS);
                                //logMessage("<b>File was successfully uploaded as binary file<br>Image can be loaded successfully.</b>", state.SUCCESS);

                            }, (sender, args) => {
                                deferred.reject();
                                //logMessage("File upload failed " + args.get_message(), state.ERROR);

                            });
                        });;
                    }).fail((jqXHR, textStatus) => {
                        deferred.reject();
                        //logMessage(textStatus, state.ERROR);
                        //logMessage("File '" + appWebUrl + sourcePath + "' failed.<br>" + textStatus);
                    });

                },
                // in case of error
                (sender, args) => {
                    deferred.reject();
                    //logMessage(args.get_message(), state.ERROR);
                });

            return deferred.promise();
        }

        ensureTargetFolder(relativeUrl: string, folderPath: string): JQueryPromise<SP.Folder> {
            // to find the root folder, we need to traverse down the path until we find a 
            // folder that actually exists

            var parts = folderPath.split('/').filter((value) => { return value.trim() != '' });
            parts = parts.reverse();

            var deferred: JQueryDeferred<SP.Folder> = jQuery.Deferred<SP.Folder>();

            var folder = this.hostWebContext.get_web().getFolderByServerRelativeUrl(relativeUrl);
            this.hostWebContext.load(folder);
            this.hostWebContext.executeQueryAsync(() => {
                this.ensureChildFolders(folder, parts).then((folder) => {
                    deferred.resolve(folder);
                });
            }, (sender, args) => {
                deferred.reject();
            });

            return deferred.promise();
        }

        ensureChildFolders(parentFolder: SP.Folder, folderStructure: string[]): JQueryPromise<SP.Folder> {
            // try to get the current path... when that succeedes; execute the function appending 
            // the next folder, if it doesn't; first create that folder

            var deferred: JQueryDeferred<SP.Folder> = jQuery.Deferred<SP.Folder>();

            if (folderStructure.length == 0) {
                deferred.resolve(parentFolder);
            }
            else {
                var folderUrl = folderStructure.pop();

                var folderRelativeUrl = Utils.appendPath(parentFolder.get_serverRelativeUrl(), folderUrl);

                var childFolder = this.hostWebContext.get_web().getFolderByServerRelativeUrl(folderRelativeUrl);
                this.hostWebContext.load(childFolder);

                this.hostWebContext.executeQueryAsync(() => {
                    // folder exists; continue with the next part
                    this.ensureChildFolders(childFolder, folderStructure).then((folder) => {
                        deferred.resolve(folder);
                    });
                }, (sender, args) => {
                    // folder doesn't exist; create it and then continue
                    childFolder = parentFolder.get_folders().add(folderUrl);

                    this.hostWebContext.load(childFolder);
                    this.hostWebContext.executeQueryAsync(() => {
                        this.ensureChildFolders(childFolder, folderStructure).then((folder) => {
                            deferred.resolve(folder);
                        });
                    }, (sender, args) => {
                        deferred.reject();
                    });
                });
            }

            return deferred.promise();
        }
    }
}