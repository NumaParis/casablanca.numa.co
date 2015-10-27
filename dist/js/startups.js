(function(angular) {
  'use strict';
// The angular startup script
angular.module('Camping', ['ngAnimate'])

.service('loadStartups', function($http) {
    return function() {
        return $http.get('../assets/startups.json').then(function(response) {
            return response.data.startups;
        });
    };
})


// .controller('ScrollController', ['$scope', '$location', '$anchorScroll',
// function ($scope, $location, $anchorScroll) {
//   $scope.gotoBottom = function() {
//     // set the location.hash to the id of
//     // the element you wish to scroll to.
//     $location.hash('bottom');

//     // call $anchorScroll()
//     $anchorScroll();
//   };
// }]);

// from https://github.com/coolaj86/knuth-shuffle/blob/master/index.js

.service('uniqueArray', function() {
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    return function(array) {
        return array.filter( onlyUnique );
    }
})

.service('Filters', function() {
    var selection = {
        tags: [],
        seasons: []
    };

    function getItemIndex(field, value) {
        // get the checked item position (or -1 if not selected)
        return selection[field].indexOf(value);
    };

    return {
        selection: selection,
        isSelected: function(field, value) {
            return getItemIndex(field, value) > -1;
        },
        toggle: function(field, value) {
            var selectionIndex = getItemIndex(field, value);
            if (selectionIndex > -1) {
                // remove item
                selection[field].splice(selectionIndex, 1);
            } else {
                // add item
                selection[field].push(value);
            }
        }
    }
})

.controller('FilterCtrl', function(Filters) {

    this.isSelected = function(field, value) {
        return Filters.isSelected(field, value)
    };

    this.toggle = function(field, value) {
        Filters.toggle(field, value);
    };

})

.filter('filterStartups', function(Filters) {
    return function(array) {

        var results = [];

        var filterTags = Filters.selection.tags.length > 0,
            filterLevels = Filters.selection.seasons.length > 0;

        angular.forEach(array, function(startup) {
            var hasTag = false,
                hasLevel = false;

            angular.forEach(startup.tags, function(tag) {
                if (Filters.selection.tags.indexOf(tag)>-1) {
                    hasTag = true;
                }
            });

            hasLevel = Filters.selection.seasons.indexOf(startup.season) > -1;

            if ((!filterTags || hasTag) && (!filterLevels || hasLevel)) {
                results.push(startup);
            }

        });

        return results;
    };
})

.controller('MainCtrl', function(loadStartups, uniqueArray) {

    function getUniqueTags() {
        var tags = [];
        angular.forEach(self.startups, function(startup) {
            tags = tags.concat(startup.tags);
        });
        return uniqueArray(tags);
    }

    this.name = 'world';

    this.startups = [];
    this.seasons = ["season1", "season2", "season3", "season4", "season5", "season6", "rise"];

    var self = this;
    loadStartups().then(function(startups) {
        self.startups = startups;
        self.tags = getUniqueTags();
        self.tags.sort();
    });

});
})(window.angular);