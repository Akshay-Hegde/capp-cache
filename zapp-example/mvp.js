/**
 * Created by maximdrabkin on 07/12/2015.
 */
;(function () {

    window.Capriza = window.Capriza || {};
    var iOSFiler = window.Capriza.iOSFiler = {};

    iOSFiler.readJSON = function (path) {
        Logger.debug('[capriza-ios-filer] requesting zappData from js');
        return new Promise(function(resolve, reject) {
            if(iOSFiler.zappData) {
                Logger.debug('[capriza-ios-filer] resolving zappData right away - data was already set by native');
                iOSFiler.__readJSON_resolveCallback = null;
                resolve(iOSFiler.zappData);
            }
            else {
                Logger.debug("[capriza-ios-filer] data wasn't set yet - saving resolve callback for later");
                iOSFiler.__readJSON_resolveCallback = resolve;
                iOSFiler.__timeout = setTimeout(function(){
                    Logger.debug("[capriza-ios-filer] rejecting readJSON because of timeout of 10 seconds");
                    reject();
                },10000);
            }
        });
    };

    iOSFiler.setZappData = function(zappData) {
        Logger.debug("[capriza-ios-filer] setting zappData from native");
        try {
            iOSFiler.zappData = JSON.parse(decodeURIComponent(zappData));
        }
        catch(e) {
            iOSFiler.zappData = {};
        }
        // if the resolve callback is already defined, resolve it now.
        if(iOSFiler.__readJSON_resolveCallback) {
            Logger.debug("[capriza-ios-filer] resolving readJSON from setZappData");
            iOSFiler.__timeout && clearTimeout(iOSFiler.__timeout);
            iOSFiler.__timeout = null;
            iOSFiler.__readJSON_resolveCallback(iOSFiler.zappData);
            iOSFiler.__readJSON_resolveCallback = null;
        }
    };

    iOSFiler.exists = function() {
        return new Promise(function(resolve, reject) {
            var msg = "Supressing call to exists, cordova not ready yet.";
            Logger.debug(msg);
            reject({
                code: 13,
                description: msg
            });
        })
    }

})();

(function () {

    var fileType = '.json', zappsFolder = "zappDb";
    var writingPromise = typeof Promise !== "undefined" ? new Promise(function(resolve){
        return resolve(true);
    }) : undefined;

    var errorCodes = [
        ' ',
        'NOT_FOUND_ERR',
        'SECURITY_ERR',
        'ABORT_ERR',
        'NOT_READABLE_ERR',
        'ENCODING_ERR',
        'NO_MODIFICATION_ALLOWED_ERR',
        'INVALID_STATE_ERR',
        'SYNTAX_ERR',
        'INVALID_MODIFICATION_ERR',
        'QUOTA_EXCEEDED_ERR',
        'TYPE_MISMATCH_ERR',
        'PATH_EXISTS_ERR',
        'CORDOVA_NOT_READY'
    ];

    function writeGlobalInfoFile() {
		if (!Utils.getFiler()) return;
		
        var globalInfoFilePath = Utils.getBGGlobalFilePath();

        var unique_tokenStr = ClientCache.getItem('unique_token');
        var unique_token = unique_tokenStr ? JSON.parse(unique_tokenStr) : "";

        var globalDataObj = {
            infoType: 'global',
            uniqueToken: unique_token,
            device_id: window.device && window.device.uuid,
            latest_version: window.appData && window.appData.current_mobile_version,
            userEmail: ClientCache.getItem("userEmail"),
            loginExpirationTime: ClientCache.getItem("loginExpirationTime"),
            authCookies: ClientCache.getItem("authCookies"),
            authCookiesZappMap: ClientCache.getItem("authCookiesZappMap")
        };

        var ssoCookies = window.MBOOT && window.MBOOT.Query.params['ssoCookies'];
        if (ssoCookies) {
            globalDataObj.ssoCookies = ssoCookies;
        }

        var globalDataStr = JSON.stringify(globalDataObj);

		// Utils.getFiler().remove(globalInfoFilePath).then(function(){
		writingPromise = writingPromise.then(function (result) {
			return Utils.getFiler().write(globalInfoFilePath, globalDataStr).then(function (fileUrl) {
				Logger.debug('[loginMessageWriter] saving global data for bg service - success to file: ' + JSON.stringify(fileUrl));
			}, function (e) {
				Logger.warn('filer error write global data ' + JSON.stringify(e));
			});
		});
		// });
    }

    function writeZappDataToFile(zappDataObj, callbackSuccess, callbackError) {

        var filePath = Utils.getBGZappFilePath();

        Logger.debug('[loginMessageWriter] about to write to file: '+filePath+
            ' object with keys: '+Object.keys(zappDataObj));

        var zappDataStr = JSON.stringify(zappDataObj);

        if (Utils.getFiler()) {
            writingPromise = writingPromise.then(function(result) {
                return Utils.getFiler().readJSON(filePath).then(function(currZappData) {
                    Logger.debug('[loginMessageWriter] reading file before write has keys: ' + Object.keys(currZappData));
                    var newZappData = JSON.stringify(_.extend(currZappData , JSON.parse(zappDataStr)));
                    return Utils.getFiler().write(filePath, newZappData).then(function(fileUrl) {
                        Logger.debug('[loginMessageWriter] saving zappData for bg service - success to file: '+JSON.stringify(fileUrl));
                        callbackSuccess && callbackSuccess();
                    }, function(e) {
                        Logger.warn('filer error write credentials ' + JSON.stringify(e));
                        callbackError && callbackError(e);
                    });
                }, function(e) {
                    Logger.warn('filer error reading json before write' + JSON.stringify(e));
                    callbackError && callbackError(e);
                });
            });

            writeGlobalInfoFile();
        }
        else {
            // in case there is no filer (only in browser), also perform extend of objects so that data won't be lost
            var currentZappData = JSON.parse(ClientCache.getItem('bgs-'+Capriza.getToken()) || "{}");
            var result = JSON.stringify(_.extend(currentZappData, zappDataObj));
            ClientCache.setItem('bgs-'+Capriza.getToken(), result);

            if (Capriza.device.android && top.Capriza && top.location.href.indexOf('dev') > -1) {
                top.localStorage.setItem('bgs-'+Capriza.getToken(), result);
            }
        }
    }

    Dispatcher.on('login/success', function(data) {

        Logger.debug('login/success handler started');
        var loginData = {credentials: data.encryptedLoginMessages};

        //host - for Zapp versions < MED 18
        if (data.host) loginData.host = data.host;
        //hosts - for zapp versions >= MED 18
        if (data.hosts) loginData.hosts = data.hosts;
        var zappLoginData = _.extend(loginData, Utils.getZappGeneralData());

        writeZappDataToFile(zappLoginData);

        Dispatcher.trigger('saveXkcd', window.appData && window.appData.xkcd);

    });

    Dispatcher.on('identity/host/logout', function() {

        var filePath = Utils.getBGZappFilePath();

        if (Utils.getFiler()) {
            Utils.getFiler().remove(filePath).then(function() {
                Logger.debug("file "+filePath+" successfully removed");
                Dispatcher.trigger('identity/host/logout/dataRemoved');
            }, function() {
                Logger.error("Error removing "+filePath+" file");
            });
        }
    });

    function getMvpId(localMvpObj) {
        if (localMvpObj.length > 0) {
            return localMvpObj[0].page && localMvpObj[0].page.contextId;
        }
    }

    Dispatcher.on('mvp/saveMvpInFile', function(localMvpObj) {

        Logger.debug('[saveMvpInFile - saveMvp] saving mvp');

        ClientCache.setItem('bgs-'+Capriza.getToken()+'-mvpId', getMvpId(localMvpObj));

        var zappLoginData = _.extend(Utils.getZappGeneralData(), {mvp: localMvpObj});

        writeZappDataToFile(zappLoginData);
    });

    //Dispatcher.on('blueprint/saveInFile', function(blueprintObj) {
    //
    //    Logger.debug('[saveInFile - saveBlueprint] saving');
    //
    //    var zappGeneralData = Utils.getZappGeneralData() || {};
    //    var zappAllData = _.extend(_.clone(zappGeneralData), {blueprint: blueprintObj});
    //
    //    writeZappDataToFile(zappAllData,zappGeneralData);
    //});

    Dispatcher.on('mobile/setToZappDB', function(options) {

        if (!window.appData) {
            Logger.debug('appData doesnt exist. stopping.');
            return;
        }

        var zappLoginData = Utils.getZappGeneralData();
        zappLoginData[options.key] = options.value;

        if (options.key === 'tiles') {
            zappLoginData["timeUpdate"] = new Date();
        }


        var filePath = Utils.getBGZappFilePath();

        Logger.debug('[loginMessageWriter/setToZappDB] getting filePath: '+filePath);

        writeZappDataToFile(zappLoginData);
    });

    Dispatcher.on("mobile/readyForBackground", function(ready){

        Logger.debug("[loginMessageWriter][readyForBackground] trying to update readyForBackground to: " + ready);

        if (!Capriza.push_token || !Capriza.bundle_id || !Capriza.zappToken) {
            Logger.debug("[loginMessageWriter][readyForBackground] Error updating readyForBackgroun. zappToken, push_token or bundle_id are missing.");
            return;
        }

        var params = {
            "u_app_tokens": [Capriza.zappToken],
            "ready": ready,
            "device": {
                "push_token": Capriza.push_token,
                "bundle_id": Capriza.bundle_id
            }
        };

        updateBackgroundZapps(params,
            function(){Logger.debug("[loginMessageWriter][readyForBackground] update success!")},
            function(err){Logger.debug("[loginMessageWriter][readyForBackground] update failed: " + err)}
        );
    });


    function updateBackgroundZapps(params, callbackSuccess, callBackError){
        Logger.debug("updateBackgroundZapps] Updating background Zapps called.");

        var http = new XMLHttpRequest();
        var url = Capriza.apiHost + "/catalog/devices/update_bgrd_zapps.json";

        Logger.debug("updateBackgroundZapps] using api url: " + url);

        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.withCredentials = true;

        function error(http, err){
            var errMsg = "[updateBackgroundZapps] Error: " + err + ". response: " + http.status;
            Logger.debug(errMsg);
            callBackError(errMsg);
        }

        http.onload = function(){
            if (http.status == 200 && http.response) {
                try {
                    var response = JSON.parse(http.response);
                }
                catch (err) {
                    error(http, "[updateBackgroundZapps] Error parsing server response! err: " + err + ". response: " + http.response);
                    return;
                }

                if (response.success) {
                    Logger.debug("[updateBackgroundZapps] update success!");
                    callbackSuccess();
                }
                else
                    error(http, "[updateBackgroundZapps] update error! status: " + http.status + ", statusText: " + http.statusText + ", returned error: " + response.error);
            }
            else error(http, "[updateBackgroundZapps] update error! status: " + http.status + ", statusText: " + http.statusText);
        };

        http.send(JSON.stringify(params));
    }

    Dispatcher.on('mobile/dataStoreRead', function() {

        Logger.debug('going to send dataStoreRead');

        var filePath = Utils.getBGZappFilePath();

        function sendDataStore(dataStore) {

            if (dataStore) {
                var dataStoreReadMsg = {
                    type: "dataStoreRead",
                    data: dataStore,
                    time: new Date()
                };
                Logger.debug('sending dataStoreRead '+JSON.stringify(dataStore));
                ComManager.send('ROUTE', dataStoreReadMsg, {});
            }
        }

        var dataStore = Utils.getZappGeneralData().dataStore;
        if (Utils.getFiler()) {
            Utils.getFiler().readJSON(filePath).then(function(fileContentObj) {
                dataStore = fileContentObj.dataStore;
                sendDataStore(dataStore);

            } ,function(err) {
                Logger.debug('Error mobile/dataStoreRead - unable to read '+filePath+' error: '+JSON.stringify(err));
                sendDataStore(dataStore);
            }).catch(function(exc) {
                Logger.debug('Exception in mobile/dataStoreRead. '+exc);
                Logger.debug('stack: '+exc.stack);
            });

        }
        else {
            sendDataStore(dataStore);
        }


    });

    function createFileIfNeeded(filer) {
        if (filer) {
            var filePath = Utils.getBGZappFilePath();
            Logger.debug('[loginMessageWriter createFileIfNeeded] checking if file ' + filePath + ' exist');

            filer.exists(filePath).then(function (result) {
                Logger.debug('[loginMessageWriter createFileIfNeeded] is file ' + filePath + ' already exist? ' + JSON.stringify(result));
                if (!result) {
                    writingPromise = writingPromise.then(function (result) {
                        return filer.write(filePath, "{}").then(function (result) {
                            Logger.debug("creating " + filePath + " for the first time. result is: " + JSON.stringify(result));
                        }, function (error) {
                            Logger.warn("[loginMessageWriter createFileIfNeeded] Error in write " + filePath + " error: " + JSON.stringify(error));
                        });
                    });
                }
                else {
                    Logger.debug('[loginMessageWriter createFileIfNeeded] file ' + filePath + ' already exist');
                }
            }, function (error) {
                Logger.warn('error in exists file ' + filePath + ' error is: ' + errorCodes[error.code] + ' full error is: ' + JSON.stringify(error));
            })


        }
        else {
            Logger.debug('loginMessageWriter createFileIfNeeded file is not created. Capriza.Capp.filer not ready');
        }
    }

    Dispatcher.on("app/loaded",function(){
        Logger.debug('loginMessageWriter app/loaded received');
        createFileIfNeeded(Utils.getFiler());
        window.Dispatcher.trigger("appName/change");
    });

    document.addEventListener("deviceready",function(){
        Logger.debug('loginMessageWriter deviceready received');
        var intervalHandler = setInterval(function () {
            if (Capriza.Capp && Capriza.Capp.filer2 && Capriza.Capp.filer2.persistent) {
                createFileIfNeeded(Capriza.Capp.filer2.persistent);
                clearInterval(intervalHandler);
            }
            else {
                Logger.debug('[loginMessageWriter] waiting for Capriza.Capp.filer2.persistent');
            }
        }, 100);

        window.Dispatcher.trigger("appName/change");
    });

	MBus.on("clientCache/setItem/authCookiesZappMap", function() {
		writeGlobalInfoFile();
	});

    Dispatcher.on('mvp/remove', function() {
        Logger.debug('mvp/remove called');

        if (Utils.getFiler()) {
            var filePath = Utils.getBGZappFilePath();
            Logger.debug('going to remove '+filePath);
            Utils.getFiler().read(filePath).then(function(zappData) {
                try {
                    Logger.debug('[mvp/remove] found file: '+filePath);
                    var zappDataObj = JSON.parse(zappData);
                }
                catch (ex) {
                    Logger.debug('Error mvp/remove parsing: '+ex+' Stack: '+ex.stack);
                    return;
                }

                delete zappDataObj.mvp;

                writeZappDataToFile(zappDataObj);


            }, function(e) {
                if (e.code === 1) {
                    Logger.warn('[mvp/remove] Warning: file: '+filePath+' does not exist');
                }

            });
        }

        Capriza.Views.MVPageView.removeCachedMVP();
        ClientCache.removeItem('bgs-'+Capriza.getToken()+'mvpId');
    });

    Utils.getBGZappFilePath = function() {
        var zappToken = window.appData ? window.appData.app_token : location.pathname.replace('/', '');
        return zappsFolder+'/'+zappToken+fileType;
    };

    Utils.getZappGeneralData = function() {

        if (!window.appData) {
            Logger.debug('no appdata. maybe an mvp from file');
            return;
        }

        return {
            zappToken: appData && appData.app_token || location.pathname.substring(1),
            zappName: appData && appData.app_name,
            rtPubKey: window.Capriza.rtPublicKey,
            medVersion: Capriza.zappInfo && Capriza.zappInfo.med_version,
            zapp_url: location.href,
            device_id: window.device && window.device.uuid,
            zappId: appData && appData.app_id,
            medLevel: Capriza.medLevel
        };
    };

    Utils.getMvpFromFile = function(mvpStoreKey, loadMvpCallback) {
        Logger.debug('getMvpFromFile started from: '+Utils.getBGZappFilePath());
        if (Utils.getFiler()) {
            Utils.getFiler().readJSON(Utils.getBGZappFilePath()).then(function(zappData) {
                Logger.debug('[getMvpFromFile] read returned zappData: ');
                var fileMvpArray = zappData.mvp;

                if (!fileMvpArray || fileMvpArray.length == 0) {
                    Logger.debug('No file mvp found');
                    loadMvpCallback();
                    return;
                }

                Logger.debug('found file mvp!');

                var fileMvpTimeStamp = fileMvpArray[0].page.timestamp;

                var momentDate = moment(parseFloat(fileMvpTimeStamp));
                var formattedDate = momentDate.format('MM/DD/YYYY [at] hh:mma');

                Logger.debug('fileMvp timestamp is: '+formattedDate);

                //var processedFileMvp = SharedUtils.processMvpResponse(fileMvpArray);

                Logger.debug('after processing fileMvp: '+fileMvpArray.length+' messages');
                loadMvpCallback(fileMvpArray);
                setTimeout(function(){
                    if (!Utils.getFiler()) {
                        ClientCache.setItem('bgs-'+Capriza.getToken(), JSON.stringify(zappData));
                    }

                }, 100);
            }, function(){
                Logger.warn("readJSON failed");
                loadMvpCallback();
            });
        }
        else {
            Logger.debug('getFiler is not ready');
            loadMvpCallback();
        }
    };

    Utils.saveBlueprintInFile = function(blueprintObj, callbackSuccess, callbackError){
        Logger.debug('[saveInFile - saveBlueprint] saving');

        var zappGeneralData = Utils.getZappGeneralData() || {};
        var zappAllData = _.extend(zappGeneralData, {blueprint: blueprintObj});

        writeZappDataToFile(zappAllData, callbackSuccess, callbackError);
    };

    Utils.getBlueprintFromFile = function(params, loadBlueprintCallback) {
        Logger.debug('[getBlueprintFromFile] started from: '+Utils.getBGZappFilePath());
        if (Utils.getFiler()) {
            Utils.getFiler().readJSON(Utils.getBGZappFilePath()).then(function(zappData) {
                Logger.debug('[getBlueprintFromFile] read returned zappData ');
                var fileBlueprint = zappData && zappData.blueprint;

                if (!fileBlueprint) {
                    Logger.debug('[getBlueprintFromFile] No file blueprint found');
                    loadBlueprintCallback();
                    return;
                }

                Logger.debug('[getBlueprintFromFile] found file blueprint!');
                loadBlueprintCallback(fileBlueprint);

            }, function(){
                Logger.warn("[getBlueprintFromFile] readJSON failed");
                loadBlueprintCallback();
            });
        }
        else {
            Logger.debug('[getBlueprintFromFile] getFiler is not ready');
            loadBlueprintCallback();
        }
    };

    //This is here only for ~MED 6 becuase the old Mobile overrides the Utils object, and this runs after the mobile.
    Utils.getFiler = Utils.getFiler || function() {
        function isiOSWrapper(){
            //isReloadFromZapp -  relevant from MED9 to MED13, and meant to prevent MVP to show (to be loaded from file when signing out)
            if (!Capriza.device || !Capriza.device.ios || !Capriza.isStore || !Capriza.cordova || Capriza.isReloadFromZapp) return false;
            var version = Capriza.cordova.split(".");
            return parseInt(version[0]) >= 9;  // return true only for wrapper version starting from 9.0.0
        }

        try {
            //don't cache the filer, in ios the filer changes from ios filer to cordova's filer at some point.
            return (filer = (
            Capriza.rnFiler ||
            (Capriza.Capp && Capriza.Capp.filer2 && Capriza.Capp.filer2.persistent) ||
            (Capriza.Capp && Capriza.Capp.filer && Capriza.Capp.filer.persistent) ||
            (top.Capriza.Capp && top.Capriza.Capp.filer2 && top.Capriza.Capp.filer2.persistent) ||
            (top.Capriza.Capp && top.Capriza.Capp.filer && top.Capriza.Capp.filer.persistent) ||
            (isiOSWrapper() && Capriza.iOSFiler)));
        }
        catch(ex) {
            Logger.debug('cant getFiler. exception: '+ex);
            return false;
        }

    };
})();

/**
 * Created by oriharel on 10/14/15.
 */

var Logger = (typeof window !== 'undefined' && window.Logger) || {
        debug: function(msg) {
            console.log('Logger '+msg);
        },
        warn: function(msg) {
            console.warn('logger '+msg);
        },
        trace: function(msg) {
            //console.trace('logger '+msg);
        },
        error: function(message, stack, type) {
            console.error('logger '+message);
            console.error('logger stack: ', stack);
            console.error('logger type: '+type);
        }
    };


var SharedUtils = {

    mbootLevel: 1,

    isObject: function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    },
    isUiControl: function(obj) {
        if (!this.isObject(obj)) return false;
        return Object.keys(obj).indexOf('type') >= 0 ||
            Object.keys(obj).indexOf('parent') >= 0 ||
            Object.keys(obj).indexOf('data') >= 0;
    },
    isPage: function(obj) {
        if (!this.isObject(obj)) return false;
        return Object.keys(obj).indexOf('presentationControl') >= 0
    },

    disableWhiteListType: ['clientbutton', 'panel', 'bubble', 'content', 'tabController', 'tab', 'main', 'topLevel'],
    disableSupportedType: ["textbox", "listbox", "button", "link"],

    setDisabledForMvp: function(jsonObj) {
        var isMVPPP = false;
        if (SharedUtils.isUiControl(jsonObj)) {
            if (SharedUtils.disableWhiteListType.indexOf(jsonObj.type) > -1 /* Whitelist */) {
                //doing nothing
            }
            else if (SharedUtils.disableSupportedType.indexOf(jsonObj.type) > -1 && jsonObj.detachMode /* MVP++ */){
                //isMVPPP = true;
                Logger.debug(jsonObj.id + " is MVP++ " + jsonObj.detachMode)
            }
            else {
                jsonObj.isDisabled = true;
            }
        }

        if ((SharedUtils.isUiControl(jsonObj) || SharedUtils.isPage(jsonObj)) && !jsonObj.detachMode) {

            if(("" + jsonObj.id).indexOf("_cached") === -1) {
                jsonObj.id = jsonObj.id + '_cached';
            }

            if (jsonObj.data) {
                jsonObj.data.id = jsonObj.id;
            }

            if (jsonObj.parent && ("" + jsonObj.parent).indexOf("_cached") === -1) {
                jsonObj.parent = jsonObj.parent + '_cached';
            }


        }

        var self = this;

        Object.keys(jsonObj).forEach(function(key) {

            var currVal = jsonObj[key];

            if (Array.isArray(currVal)) {

                currVal.forEach(function(jsonObjArrayItem) {

                    if (SharedUtils.isUiControl(jsonObjArrayItem)) {
                        isMVPPP = self.setDisabledForMvp(jsonObjArrayItem) || isMVPPP;
                    }
                });

            }

            if (SharedUtils.isUiControl(currVal) || SharedUtils.isPage(currVal)) {
                isMVPPP = self.setDisabledForMvp(currVal) || isMVPPP;
            }
        });

        return isMVPPP;
    },

    processMvpResponse: function(response) {

        //get rid of the mvp flag
        if (response.page) {
            delete response.page.mvp;
            response.page.timestamp = Date.now();
        }
        delete response.mvp;

        try {
            var isMVPPP =  SharedUtils.setDisabledForMvp(response);
            if(isMVPPP){
                response.mvppp = true;
            }
        }
        catch (ex) {
            Logger.error('unable to set disable for response', ex, "mvp", JSON.stringify(response));
        }


        return response;

    },

    readCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(";");
        for (var i = 0, ii = ca.length; i < ii; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ")
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    getBulkMsg: function(msgs){
        SharedUtils.bulkCount = (SharedUtils.bulkCount || 0) + 1;
        return {type: "bulk", messages: msgs, bulkMsgId: "bulk" + SharedUtils.bulkCount};
    },

    get: function mbootLevel() {
        return this.mbootLevel;
    },

	loadPasscodeTimeout:function(userId){
		return SharedUtils.readCookie(userId+"_passcodeTimeout");
	},

	isNumeric: function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

    getCacheModes: function(cacheMode) {
        // when no cacheMode is sent, assume no cache for struct and no cache for state
        cacheMode = cacheMode || "none/none";
        var cacheModes = cacheMode.split("/");
        return {structMode: cacheModes[0], stateMode: cacheModes[1]};
    },

    calcLocalStorageSize: function() {
        var _lsTotal=0,_xLen,_x;

        for(_x in localStorage){
            if (!isNaN(localStorage[_x].length)) {
                _xLen= ((localStorage[_x].length + _x.length)* 2);
                _lsTotal+=_xLen;

                // console.log(_x.substr(0,50)+" = "+ (_xLen/1024).toFixed(2)+" KB, so far: "+_lsTotal);
            }

        }

        var result = (_lsTotal / 1024).toFixed(2);
        console.log("Local storage size is: " + result + " KB");
        return result;

    }

};

if (typeof module !== 'undefined') {
    module.exports = SharedUtils;
}
else {
    window.SharedUtils = SharedUtils;
}



/**
 * Created by oriharel on 11/17/15.
 */
(function(){

  window.Utils = (window.Utils || {});
  window.Utils.delayedFuncs = [];

  function delayedInvocation(func, context, arguments) {
    if (!isRealLatestLoaded()) {
      window.Utils.delayedFuncs.push(func.bind(context));
    }
    else {
      func.bind(context, arguments)();
    }
  }

  var originalRunnerRun = Runner.run;

  Runner.run = function() {
    console.log('[latestCompat] discarding Runner.run');
    delayedInvocation(originalRunnerRun, this, arguments[0]);
  };

  var originalRunnerRunSession = Runner.runSession;

  Runner.runSession = function() {
    console.log('[latestCompat] discarding Runner.runSession');
    delayedInvocation(originalRunnerRunSession, this);
  };

  var originalRunnerRunAjax = Runner.runAjax;

  Runner.runAjax = function() {
    console.log('[latestCompat] discarding Runner.runAjax');
    delayedInvocation(originalRunnerRunAjax, this);
  };

  if (Capriza.Views && Capriza.Views.SideMenu) {
    var originalSideMenuInitSession = Capriza.Views.SideMenu.init;

    Capriza.Views.SideMenu.init = function() {
      console.log('[latestCompat] discarding Capriza.Views.SideMenu.init');
      delayedInvocation(originalSideMenuInitSession, this, arguments[0]);
    };
  }

  if (Capriza.avatarAPI) {
    var originalGetUserImage = Capriza.avatarAPI.getUserImage;
    var originalGetUserEmail = Capriza.avatarAPI.getUserEmail;
  }

  Capriza.avatarAPI = Capriza.avatarAPI || {};
  window.Utils.getUserImageCalls = [];
  window.Utils.getUserEmailCalls = [];
  Capriza.avatarAPI.getUserImage = function(callback) {

    if (!isRealLatestLoaded()) {
      window.Utils.getUserImageCalls.push(callback);
    }
    else {
      originalGetUserImage(callback);
    }
  };

  Capriza.avatarAPI.getUserEmail = function(callback) {

    if (!isRealLatestLoaded()) {
      window.Utils.getUserEmailCalls.push(callback);
    }
    else {
      originalGetUserEmail(callback);
    }
  };


  function isRealLatestLoaded() {
    return window.ComManager;
  }

  Utils.getLatestJSPath = function() {
    var result = "";
    if (window.cappCache){
      cappCache.getLoadedResources().forEach(function (resource) {
        var src = resource.url;
        if (src && src.indexOf('mvp.js') > -1) {
          result = src
        }
      });
    } else {
      $('script').each(function () {
        var src = this.getAttribute('src');
        if (src && src.indexOf('mvp.js') > -1) {
          result = src
        }
      });
    }
    return result;
  };

  // register jquery ajax calls inspector
  var runApiCall = new RegExp('^http[s]?:\/\/[^/]+\/run\/[^/]+\.json\?');
  $.ajaxPrefilter(function(options) {
    if (runApiCall.test(options.url)) {
      // if this is an old call to the api to run a session (from runAjax)
      // then add the ecdhkey to the call
      options.url += '&source=realLatest&ecdhkey='+window.MBOOT.Security.public();
      Logger.info('rewrote run api url to include include ecdhkey: ' + options.url);
    }
  });
  function scriptOnLoad() {
    Logger.debug('latest loaded');

    window.Utils.delayedFuncs.forEach(function(func) {
      func();
    });

    window.Utils.getUserImageCalls.forEach(function(callback) {
      window.Capriza.avatarAPI.getUserImage(callback);
    });

    window.Utils.getUserEmailCalls.forEach(function(callback) {
      window.Capriza.avatarAPI.getUserEmail(callback);
    });
  }
  function onContentLoaded(e) {

    if (!isRealLatestLoaded()) {
      var scriptSrc = Utils.getLatestJSPath().replace("mvp", "latest");
      if (window.cappCache){
        Logger.debug('CappCache trying to load ' + scriptSrc );
        window.cappCache.loadResources({
          resources: [{
            url: scriptSrc,
            "attributes": {
              "onload": "("+scriptOnLoad.toString() + ")()",
              "async": false
            }
          }
          ]
        });
        return;
      }
      var script = document.createElement('script');
      script.src = scriptSrc;
      Logger.debug('trying to load '+script.src);
      document.getElementsByTagName('head')[0].appendChild(script);

      script.onload = scriptOnLoad;
    }
  }

  if (document.readyState !== "loading"){
    setTimeout(onContentLoaded,0);
  } else {
    window.addEventListener("DOMContentLoaded", onContentLoaded);
  }

}());

(function () {
    function isNavigatorOnline() {
        var result = navigator.onLine;

        try {
            result = top.navigator.onLine;
        } catch (ex) {
            // do nothing
        }
        return result;
    }

    Capriza.Connection = {
        isOnline: isNavigatorOnline(),

        updateOnlineStatus: function (isOnline) {
            if (isOnline === true) {
                pageManager.hideLoadingMsg();
            } else {

                var reasonTxt;
                if (Capriza.translator) {
                    reasonTxt = Capriza.translator.getText(Capriza.translator.ids.sorryLostConnection);
                }
                else {
                    reasonTxt = "Sorry, your connection has either been lost or is temporarily unavailable. Please try again later or use the desktop version, if applicable.";
                }

                pageManager.generateErrorPage({errorType: 'connectionLost', nonFatal: true, reason: reasonTxt});
            }
        },

        connectionListener: function () {
            if (Capriza.isPhonegap && _urlParams.isIframe) {
                listenToConnectivityEvents(top.document);
            } else if(Capriza.isPhonegap){
                document.addEventListener("deviceready", function(){ listenToConnectivityEvents(document)});
            } else {
                listenToConnectivityEvents(window);
            }
        },

        cleanConnectionListener: function () {
            if (Capriza.isPhonegap && _urlParams.isIframe) {
                stopListenToConnectivityEvents(top.document);
            }
        }
    };

    var connectivityTimeout;

    function onConnectivityChange(event) {
        var isOnline = ("online" == event.type);
        Capriza.Connection.isOnline = isOnline;
        Dispatcher.trigger("app/" + event.type);
        Capriza.Connection.updateOnlineStatus(isOnline);
    }

    // Listens for online/offline events and triggers corresponding app events
    function listenToConnectivityEvents(provider){
        provider.addEventListener("online", onConnectivityChange, false);
        provider.addEventListener("offline", onConnectivityChange, false);
    }

    function stopListenToConnectivityEvents(provider){
        provider.removeEventListener("online", onConnectivityChange, false);
        provider.removeEventListener("offline", onConnectivityChange, false);
    }

    $(window).on("load",function () {
        Capriza.Connection.connectionListener();
    });

    $(window).on("unload", function () {
        Capriza.Connection.cleanConnectionListener();
    })

})();

(function () {
    var Napi = Capriza.Napi = {

        Event: function Event(data) {

            this.data = data || {};

            if (window.appData) {
                this.appId = appData.app_id;
            }


            if (window.ComManager) {
                this.sessionId = ComManager.sessionId();
            }

        },

        StatsEvent: function StatsEvent(category, data) {

            Capriza.Napi.Event.call(this, data);

            data = data || {};

            this.type = data.type || 'events';
            this.source = data.type === 'pageInfo' ? 'pageInfo' : (data.source || 'mobile');
            this.category = category;

            this.data.startTimeStamp = new Date().getTime();

            if (window.ComManager && ComManager.ntpOffset !== undefined) {
                this.data.ntpOffset = ComManager.ntpOffset;

                this.data.startTimeStamp -= ComManager.ntpOffset;

            }


            this.end = function () {
                this.data.endTimeStamp = new Date().getTime();

                if (window.ComManager && ComManager.ntpOffset !== undefined) {
                    this.data.endTimeStamp -= ComManager.ntpOffset;
                }
            };
        },

        send: function (path, data, ajaxOptions) {


            var defaults = {
                type: 'POST',
                url: Config.napiUrl + path,
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json'
            };

            // Overwrite default options
            // with user provided ones
            // and merge them into "options".
            ajaxOptions = $.extend({}, defaults, ajaxOptions);

           return $.ajax(ajaxOptions);


        },


        sendStats: function (events, ajaxOptions) {
            if (!Array.isArray(events)) {
                events = [events];
            }

            //filter out source:mobile
            var filteredEvents = events.filter(function(event) {
                return event.source != 'mobile';
            });

            if (filteredEvents.length > 0) {
                var statsEvent = {version: "1.1", data: filteredEvents};
                this.send("/stats/events", statsEvent);
            }



        }
    };
})();

(function () {

    Dispatcher.on("runner/run", function (appData) {
        if (window.appData && window.appData.config) {
            Capriza.Profiler.on = (ClientCache.getItem("isMonitored") && ClientCache.getItem("isMonitored") === "true") ||
                (!!window.appData.config.runPerfMonitor ||
                Capriza.isMonitored ||
                (location && location.href && location.href.indexOf('dev.capriza.com') > -1) ||
                (location && location.href && location.href.indexOf('test.capriza.com') > -1));
            ClientCache.setItem("isMonitored", Capriza.Profiler.on);
        }
    });
    var Profiler = Capriza.Profiler = {on: true, loaded: true};

    Profiler.ProfileEvent = function ProfileEvent(name, data) {
        this.data = data || {};
        if (typeof name == "object") {
            data = name;

        } else {
            this.name = name;
        }

        if (!window.testMode) {
            Capriza.Napi.StatsEvent.call(this, "performance", data);
            // if (Capriza.cordova && data && data.type === 'pageInfo') {
            //
            //     var viewName = Capriza.zappToken+'***'+data.name;
            //
            //     if (Capriza.device.ios) {
            //         // Capriza.Capp.messenger.emit('zapp/analytics/trackView', viewName);
            //     }
            //     else {
            //         if (top.Capriza.zappAPI.trackView) {
            //             top.Capriza.zappAPI.trackView(viewName);
            //         }
            //         else {
            //             logger.debug('trackView is not implemented yet');
            //         }
            //     }
            // }
        }
        if (this.data && this.data.direction) {
            this.direction = this.data.direction;
        }
        Profiler.ProfileEvent.eventCounter++;

        if (!(this.data && this.data.manualSend)) {
            if (this.sessionId) {
                Profiler.events.push(this);
            }

        }
    };


    Profiler.ProfileEvent.eventCounter = 0;


    Profiler.events = [];
    Profiler.sentEvents = [];

    Profiler.sendTimeout = 10000;

    function readyProfileEvents() {
        var profileEvents = [];
        Profiler.events.forEach(function (event) {

            if (event.sessionId) {
                //                is event ntp synced
                if (event.data.ntpOffset !== undefined) {
                    if (event.data.async) {

                        if (event.data.endTimeStamp) {
                            profileEvents.push(event);

//                            if response took more than event timeout seconds we assume it's not coming
                        } else if ((ComManager.ntpNow() - event.data.startTimeStamp) > Profiler.sendTimeout) {
                            event.data.endTimeStamp = NaN;
                            profileEvents.push(event)
                        }

                    } else {
                        profileEvents.push(event);
                    }
//                    event isn't synced with ntp time
                } else {
//                        we can now update event with ntp time
                    if (window.ComManager && ComManager.ntpOffset !== undefined) {
                        event.data.ntpOffset = ComManager.ntpOffset;
                        event.data.startTimeStamp -= event.data.ntpOffset;


                        if (event.data.endTimeStamp) {
                            event.data.endTimeStamp -= event.data.ntpOffset
                        }

//                        still no ntp time, check for timeout without ntp
                    } else if ((Date.now() - event.startTimeStamp) > Profiler.sendTimeout) {
                        profileEvents.push(event);
                    }
                }
            }


        });

        return profileEvents;

    }

    setInterval(function () {

        if (Capriza.Profiler.on && (Profiler.events.length > 0)) {
            var profileEvents = readyProfileEvents();

            if (profileEvents.length > 0) {
                Profiler.events = _.difference(Profiler.events, profileEvents);

                Capriza.Napi.sendStats(profileEvents);

                Profiler.sentEvents = Profiler.sentEvents.concat(profileEvents);
            }

        }
    }, 5000);

//        }
//    });
})();
