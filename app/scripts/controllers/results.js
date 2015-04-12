'use strict';

/**
 * @ngdoc function
 * @name myAmericaApp.controller:ResultsCtrl
 * @description
 * # ResultsCtrl
 * Controller of the myAmericaApp
 */
angular.module('myAmericaApp')
  .controller('ResultsCtrl', function ($scope, $rootScope, RecAreas, RIDB_API_KEY, Flickr,UserList) {
    $rootScope.temp = [];
    $scope.$on('questionsAnswered', function(event, args) {
      $scope.age = args["answer1"];
      $scope.lengthOfStay = args["answer2"];
      $scope.interests = args["interests"];
      if(args["state"]) {
        $scope.state = args["state"];
        RecAreas.get({"apikey": RIDB_API_KEY, "state": $scope.state, "activity": activities}, function(results) {
          $scope.results = results;
        });
      }
      else{
        $scope.lat = args["lat"];
        $scope.lng = args["lng"];
        RecAreas.get({"apikey": RIDB_API_KEY, "latitude": $scope.lat, "longitude": $scope.lng, "activity": activities}, function(results) {
          $scope.results = results;
        });
      }
      // do what you want to do
    });

	$scope.createMap = function(results){
		var map = L.map('mapResults').setView([$scope.lat, $scope.lng], 10);

		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		$(results['RECDATA']).each(function(i, v){
			if (v.RecAreaLatitude != "" && v.RecAreaLongitude != ""){
				var title = v.RecAreaName;
				var contactEmail = v.RecAreaEmail;
				var contactPhone = v.RecAreaPhone;
				var website = v.RecAreaMapURL;

				var popUpText = "<strong>" + title + "</strong>";

				if (website != ""){
					popUpText = popUpText + "<p><a href='"+website+"'>" + website + "</a></p>";
				}

				if (contactEmail != ""){
					popUpText = popUpText + "<p>Email Address: <a href='mailto:"+contactEmail+"'>" + contactEmail + "</a></p>";
				}

				if (contactPhone != ""){
					popUpText = popUpText + "<p>" + contactPhone + "</p>";
				}

				v.photoQuery = ("SELECT  metadata FROM 1zi67I9StNeOzf5qv-wQ6WfR3n0ok_hDm6fSy0kI1 WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG("+v.RecAreaLatitude+","+ v.RecAreaLongitude+"), 50000))");
				Flickr.get({key:"AIzaSyAY3kjup98kSZ5OQ4iaxFRxWqwvtLLXfPM", sql: v.photoQuery}, function(results){
					console.log(v.photoData);
				});

				L.marker([v.RecAreaLatitude, v.RecAreaLongitude]).addTo(map)
					.bindPopup(popUpText)
					.openPopup();
			}
		});
	};

    if($rootScope.state){
      RecAreas.get({"apikey": RIDB_API_KEY, "state": $rootScope.state, "activity" : $rootScope.activitiesSelected.toString()}, function(results) {
        $scope.savePark = function savePark(parkId) {
          $rootScope.temp.push(parkId);
          $rootScope.$broadcast('parkSaved');

          UserList.create({userId: $rootScope.email, "parkId": parkId}, function(results){ });
        };

		$scope.createMap(results);

		$scope.results = results;
      });
    }
    else{
      RecAreas.get({"apikey": RIDB_API_KEY, "latitude": $rootScope.lat, "longitude": $rootScope.lng, "activity" : $rootScope.activitiesSelected.toString()}, function(results) {
        $scope.savePark = function savePark(parkId) {
          $rootScope.temp.push(parkId);
          $rootScope.$broadcast('parkSaved');

          UserList.create({userId: $rootScope.email, "parkId": parkId}, function(results){ });
        };

		$scope.createMap(results);

        $scope.results = results;

      });
    }

  });
