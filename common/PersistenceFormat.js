/**
 * Created by elad.benedict on 8/23/2015.
 */

var config = require('./Configuration');
var path = require('path');
var qio = require('q-io/fs');
var _ = require('underscore');
var Q = require('q');

const tsChunktMatch =  new RegExp(/media-([^_]+).*?([\d]+)\.ts.*/);
const rootFolder = config.get('rootFolderPath');

module.exports = persistenceFormat = {
    
    getEntryHash: function (entryId) {
        return entryId.charAt(entryId.length - 1);
    },

    getFlavorHash: function () {
        let hours = new Date().getHours().toString();
        return hours < 10 ? ("0" + hours) : hours;
    },
    
    getEntryBasePath: function (entryId) {
        return path.join(rootFolder, this.getEntryHash(entryId), entryId);
    },

    getBasePathFromFull: function (directory) {
        return path.dirname(path.dirname(directory));
    },

    getRelativePathFromFull: function (fullPath) {
        return fullPath.substr(persistenceFormat.getBasePathFromFull(fullPath).length);
    },

    getFlavorFullPath: function (entryId, flavorName) {
        return path.join(this.getEntryBasePath(entryId), flavorName.toString());
    },

    getMasterManifestName: function () {
        return 'playlist.json';
    },

    getFlavorUriExtension: function () {
        return 'chunklist.m3u8';
    },
    
    getMP4FileNamefromInfo: function(chunkPath){
         return chunkPath.replace('.ts','.mp4');
    },


    getTSChunknameFromMP4FileName: function(mp4FileName){
        return mp4FileName.replace('.mp4','.ts');
    },

    createHierarchyPath: function (destPath, entity, param) {
        let fullPath;
        let retVal = {};
        switch (entity) {
            case "entry":
                fullPath = path.join(destPath, this.getEntryHash(param));
                retVal = { fullPath };
                break;

            case "flavor":
                let hash = this.getFlavorHash();
                fullPath = path.join(destPath, hash);
                retVal = { fullPath, hash };
                if (param === hash)
                    return Q.resolve(retVal);
                break;
        }

        return qio.makeTree(fullPath)
            .then(() => {
                return retVal;
            });
    },

    compressChunkName: function(tsChunkName){
        var matched = tsChunktMatch.exec( tsChunkName );
        if(matched){
            return matched[1] + '-' + matched[2] + '.mp4';
        }
        return tsChunkName;
    }

};