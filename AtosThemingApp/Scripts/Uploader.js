var Atos;
(function (Atos) {
    var SharePoint;
    (function (SharePoint) {
        var Status;
        (function (Status) {
            Status[Status["ERROR"] = 0] = "ERROR";
            Status[Status["WARNING"] = 1] = "WARNING";
            Status[Status["SUCCESS"] = 2] = "SUCCESS";
        })(Status || (Status = {}));
        var Uploader = (function () {
            function Uploader(hostWebUrl, appWebUrl) {
                this.hostWebUrl = hostWebUrl;
                this.appWebUrl = appWebUrl;
            }
            Uploader.prototype.UploadMany = function (targets) {
                var promises;
                promises = [];
                for (var _i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
                    var target = targets_1[_i];
                    promises.push(this.Upload(target[0], target[1]));
                }
                return $.when.apply($, promises);
            };
            Uploader.prototype.Upload = function (sourcePath, targetPath) {
                var _this = this;
                var deferred = jQuery.Deferred();
                this.hostWebContext = new SP.ClientContext(SharePoint.Utils.getRelativeUrlFromAbsolute(this.hostWebUrl));
                var web = this.hostWebContext.get_web();
                this.hostWebContext.load(web);
                this.hostWebContext.executeQueryAsync(
                // in case of success
                function () {
                    console.log("Host Web successfully loaded");
                    var sourceFile = _this.appWebUrl + sourcePath;
                    //logMessage("Reading file from App Web <a href='" + sourceFile + "' target='_blank'>" + sourcePath + "</a><br /><br />", state.SUCCESS);
                    //logMessage("<img src='" + sourceFile + "'><br />");
                    // Read file from app web
                    $.ajax({
                        url: sourceFile,
                        type: "GET",
                        dataType: "binary",
                        processData: false,
                        responseType: 'arraybuffer',
                        cache: false
                    }).done(function (contents) {
                        var fileName = SharePoint.Utils.getFilenameFromUrl(targetPath);
                        var folder = SharePoint.Utils.getPathFromUrl(targetPath);
                        //logMessage("Create file at<br>    " + hostWebUrl + "/" + folder + fileName, state.SUCCESS);
                        // Create new file
                        var createInfo = new SP.FileCreationInformation();
                        // Convert ArrayBuffer to Base64 string
                        createInfo.set_content(SharePoint.Utils.arrayBufferToBase64(contents));
                        // Overwrite if already exists
                        createInfo.set_overwrite(true);
                        // set target url
                        createInfo.set_url(fileName);
                        var targetFolder = SharePoint.Utils.getRelativeUrlFromAbsolute(_this.hostWebUrl) + folder;
                        // ensure the target folder has been created 
                        _this.ensureTargetFolder(SharePoint.Utils.getRelativeUrlFromAbsolute(_this.hostWebUrl), folder).then(function (folder) {
                            // retrieve file collection of folder
                            var files = folder.get_files();
                            // load file collection from host web
                            _this.hostWebContext.load(files);
                            // add the new file
                            files.add(createInfo);
                            // upload file
                            _this.hostWebContext.executeQueryAsync(function () {
                                deferred.resolve();
                                var loadImage = _this.hostWebUrl + "/" + folder + fileName;
                                //logMessage("File uploaded succeeded", state.SUCCESS);
                                //logMessage("<b>Try to embed file from host web</b><br><br>", state.SUCCESS);
                                //logMessage("<img src='" + loadImage + "'>", state.SUCCESS);
                                //logMessage("<a href='" + loadImage + "' target='_blank'>" + folder + fileName + "</a>", state.SUCCESS);
                                //logMessage("<b>File was successfully uploaded as binary file<br>Image can be loaded successfully.</b>", state.SUCCESS);
                            }, function (sender, args) {
                                deferred.reject();
                                //logMessage("File upload failed " + args.get_message(), state.ERROR);
                            });
                        });
                        ;
                    }).fail(function (jqXHR, textStatus) {
                        deferred.reject();
                        //logMessage(textStatus, state.ERROR);
                        //logMessage("File '" + appWebUrl + sourcePath + "' failed.<br>" + textStatus);
                    });
                }, 
                // in case of error
                function (sender, args) {
                    deferred.reject();
                    //logMessage(args.get_message(), state.ERROR);
                });
                return deferred.promise();
            };
            Uploader.prototype.ensureTargetFolder = function (relativeUrl, folderPath) {
                // to find the root folder, we need to traverse down the path until we find a 
                // folder that actually exists
                var _this = this;
                var parts = folderPath.split('/').filter(function (value) { return value.trim() != ''; });
                parts = parts.reverse();
                var deferred = jQuery.Deferred();
                var folder = this.hostWebContext.get_web().getFolderByServerRelativeUrl(relativeUrl);
                this.hostWebContext.load(folder);
                this.hostWebContext.executeQueryAsync(function () {
                    _this.ensureChildFolders(folder, parts).then(function (folder) {
                        deferred.resolve(folder);
                    });
                }, function (sender, args) {
                    deferred.reject();
                });
                return deferred.promise();
            };
            Uploader.prototype.ensureChildFolders = function (parentFolder, folderStructure) {
                // try to get the current path... when that succeedes; execute the function appending 
                // the next folder, if it doesn't; first create that folder
                var _this = this;
                var deferred = jQuery.Deferred();
                if (folderStructure.length == 0) {
                    deferred.resolve(parentFolder);
                }
                else {
                    var folderUrl = folderStructure.pop();
                    var folderRelativeUrl = SharePoint.Utils.appendPath(parentFolder.get_serverRelativeUrl(), folderUrl);
                    var childFolder = this.hostWebContext.get_web().getFolderByServerRelativeUrl(folderRelativeUrl);
                    this.hostWebContext.load(childFolder);
                    this.hostWebContext.executeQueryAsync(function () {
                        // folder exists; continue with the next part
                        _this.ensureChildFolders(childFolder, folderStructure).then(function (folder) {
                            deferred.resolve(folder);
                        });
                    }, function (sender, args) {
                        // folder doesn't exist; create it and then continue
                        childFolder = parentFolder.get_folders().add(folderUrl);
                        _this.hostWebContext.load(childFolder);
                        _this.hostWebContext.executeQueryAsync(function () {
                            _this.ensureChildFolders(childFolder, folderStructure).then(function (folder) {
                                deferred.resolve(folder);
                            });
                        }, function (sender, args) {
                            deferred.reject();
                        });
                    });
                }
                return deferred.promise();
            };
            return Uploader;
        }());
        SharePoint.Uploader = Uploader;
    })(SharePoint = Atos.SharePoint || (Atos.SharePoint = {}));
})(Atos || (Atos = {}));
