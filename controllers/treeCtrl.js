thesaurexApp.controller('treeCtrl', ['$scope', 'httpPostFactory', 'mainService', 'userService', '$timeout', function($scope, httpPostFactory, mainService, userService, $timeout) {
    $scope.languages = mainService.languages;
    $scope.preferredLanguages = mainService.preferredLanguages;
    $scope.masterTree = mainService.tree.master;
    $scope.projectTree = mainService.tree.project;
    $scope.selectedElement = mainService.selectedElement;
    $scope.blockedUi = mainService.blockedUi;
    $scope.currentUser = userService.currentUser;

    $scope.expandedElement = null;

    $scope.enableDragDrop = false;
    $scope.enableEditing = false;
    $scope.enableExportDragDrop = false;

    $scope.newPrefLabelText = {};
    $scope.newAltLabelText = {};

    function toggle(collapsed, sourceNodeScope) {
        sourceNodeScope.$modelValue.collapsed = collapsed;
    }

    $scope.treeOptions = {
        toggle: toggle,
        dropped: function(event) {
            mainService.dropped(event, false);
        }
    };

    $scope.exportTreeOptions = {
        toggle: toggle,
        dropped: function(event) {
            mainService.dropped(event, true);
        }
    };

    $scope.addConcept = function(name, concept, lang, treeName) {
        mainService.addConcept(name, concept, lang, treeName);
    };

    $scope.createNewConceptModal = function(which) {
        mainService.createNewConceptModal(which, undefined, undefined, expandElement);
    };

    $scope.getContextMenu = function(item, treeName) {
        var menu = [];
        menu.push([
            function($itemScope, $event) {
                return $itemScope.$modelValue.label + '&hellip;';
            }, function($itemScope, $event) {
                return;
            }, function($itemScope, $event) {
                return false;
            }
        ]);
        menu.push(null);
        menu.push([
            '<i class="fa fa-fw fa-plus-circle light green"></i> Add new concept', function($itemScope, $event) {
                mainService.createNewConceptModal(treeName, $itemScope.$modelValue, undefined, expandElement);
            }
        ]);
        menu.push(null);
        if(item.children.length === 0) {
            menu.push([
                '<i class="fa fa-fw fa-trash light red"></i> Delete',
                function($itemScope) {
                    mainService.deleteSingleElement($itemScope.$modelValue, treeName);
                },
                function($itemScope) {
                    return $itemScope.$modelValue.children.length === 0;
                }
            ]);
        } else {
            menu.push([
                '<i class="fa fa-fw fa-trash light red"></i> Delete&hellip;',
                [
                    ['<i class="fa fa-fw fa-eraser light red"></i> and remove descendants', function($itemScope) {
                        mainService.deleteElementWithChildren($itemScope.$modelValue, $itemScope.$modelValue.label, treeName);
                    }],
                    ['<i class="fa fa-fw fa-angle-up light red"></i> and move descendants one level up', function($itemScope) {
                        mainService.deleteElementAndMoveUp($itemScope.$modelValue, $itemScope.$modelValue.broader_id, treeName);
                    }]
                ],
                function($itemScope) {
                    return $itemScope.$modelValue.children.length > 0;
                }
            ]);
        }
        menu.push(null);
        menu.push([
            '<i class="fa fa-fw fa-cloud-download light orange"></i> Export', function($itemScope, $event) {
                $scope.export(treeName, $itemScope.$modelValue.id);
            }
        ]);
        return menu;
    };

    $scope.getLanguageCode = mainService.getLanguageCode;

    $scope.uploadFile = function(file, errFiles, type, treeName) {
        $scope.f = file;
        $scope.errFiles = errFiles && errFiles[0];
        mainService.uploadFile(file, errFiles, type, treeName);
    };

    $scope.setSelectedElement = function(element, tree) {
        mainService.setSelectedElement(element, tree);
    };

    $scope.selectPreferredLanguage = function(index) {
        $scope.preferredLanguage = $scope.possibleLanguages[index];
    };

    $scope.selectAltLabelLanguage = function(index) {
        mainService.setAltLabelLanguage(index);
    };

    $scope.selectPrefLabelLanguage = function(index) {
        mainService.setPrefLabelLanguage(index);
    };

    $scope.editPrefLabelEntry = function(label) {
        mainService.setEditLabelEntry(label);
    };

    $scope.editAltLabelEntry = function(label) {
        mainService.setEditLabelEntry(label);
    };

    $scope.resetPrefLabelEdit = function(label) {
        mainService.resetLabelEdit(label);
    };

    $scope.resetAltLabelEdit = function(label) {
        mainService.resetLabelEdit(label);
    };

    $scope.storePrefLabelEdit = function(label, treeName) {
        var cid = $scope.selectedElement.properties.id;
        mainService.updatePrefLabel(label, cid, treeName);
    };

    $scope.storeAltLabelEdit = function(label, treeName) {
        var cid = $scope.selectedElement.properties.id;
        mainService.updateAltLabel(label, cid, treeName);
    };

    $scope.addPrefLabel = function(labelText, language, treeName) {
        for(var i=0; i<$scope.selectedElement.labels.pref.length; i++) {
            var l = $scope.selectedElement.labels.pref[i];
            if(l.langId == $scope.preferredLanguages.pref.id) {
                var alertTitle = 'Problem with Preferred Label';
                var alertMsg = "For the language <i>" + $scope.preferredLanguages.pref.langName + "</i> there is already a preferred label defined.";
                mainService.displayAlert(alertTitle, alertMsg);
                return;
            }
        }
        var cid = $scope.selectedElement.properties.id;
        mainService.addPrefLabel(labelText, language, cid, treeName);
        $scope.newPrefLabelText.text = '';
    };

    $scope.addAltLabel = function(labelText, language, treeName) {
        var cid = $scope.selectedElement.properties.id;
        mainService.addAltLabel(labelText, language, cid, treeName);
        $scope.newAltLabelText.text = '';
    };

    $scope.deleteBroaderConcept = function($index, broader, treeName) {
        mainService.deleteBroaderConcept($index, broader, treeName);
    };

    $scope.deleteNarrowerConcept = function($index, narrower, treeName) {
        mainService.deleteNarrowerConcept($index, narrower, treeName);
    };

    $scope.deletePrefLabel = function($index, label, treeName) {
        mainService.deleteLabel(1, $index, label, treeName);
    };

    $scope.deleteAltLabel = function($index, label, treeName) {
        mainService.deleteLabel(2, $index, label, treeName);
    };

    $scope.addBroader = function($item, treeName) {
        mainService.addBroader($item, treeName);
        $scope.broaderSearch = '';
    };

    $scope.addNarrower = function($item, treeName) {
        mainService.addNarrower($item, treeName);
        $scope.narrowerSearch = '';
    };

    angular.element(document).ready(function () {
        $scope.getWindowSize();
    });

    var expandElement = function(id, treeName) {
        $scope.$broadcast('angular-ui-tree:expand-all');
        var t = angular.element(document.getElementById(treeName + '-tree')).scope();
        t.$element[0].scrollTop = 0;
        var nodesScope = t.$nodesScope;
        var parents = nodesScope.$modelValue;
        recursiveExpansion(parents, id, treeName);
        $timeout(function(){
            var treeElems = document.getElementsByClassName("child-" + id);
            if (treeElems.length > 0){
                var topLength = angular.element(treeElems[0]).scope().$element[0].getBoundingClientRect().top;
                var t = angular.element(document.getElementById(treeName + '-tree')).scope();
                var treeDom = t.$element[0];
                var treeHeight = treeDom.getBoundingClientRect().height;
                if(topLength > treeHeight) {
                    treeDom.scrollTop = topLength - treeHeight;
                }
            }
        },100);
    };

    var recursiveExpansion = function(parents, elemId, treeName){
        for(var i=0; i < parents.length; i++){
            if (parents[i].id == elemId){
                mainService.setSelectedElement(parents[i], treeName);
                return true;
            } else if(recursiveExpansion(parents[i].children, elemId, treeName)){
                parents[i].collapsed = false;
                return true;
            }
        }
        return false;
    };

    $scope.expandElement = function($item, treeName) {
        expandElement($item.id, treeName);
    };

    $scope.getSearchTree = function(searchString, treeName, appendSearchString) {
        return mainService.getSearchResults(searchString, treeName, appendSearchString);
    };

    $scope.export = function(treeName, id) {
        var blockMsg = 'Creating ' + treeName + '_thesaurus.rdf. Please wait.';
        mainService.disableUi(blockMsg);
        var promise = mainService.promisedExport(treeName, id);
        if(!promise) {
            mainService.enableUi();
            console.log("Something bad happened to your export...");
        } else {
            promise.then(function(data) {
                mainService.enableUi();
                var filename = treeName + '_thesaurus.rdf';
                createDownloadFile(data, filename);
            });
        }
    };

    var createDownloadFile = function(data, filename) {
        var uri = 'data:text/xml;charset=utf-8,' + encodeURIComponent(data);
        var link = document.createElement("a");
        link.href = uri;
        link.style = "visibility:hidden";
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}]);

thesaurexApp.config(function(treeConfig) {
    treeConfig.defaultCollapsed = true;
});
