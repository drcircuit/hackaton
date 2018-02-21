(function(){
    angular.module("shipadoc",["ngRoute"])
        .value("apiUri", "http://localhost:8080/api/")
        .factory("api", ["$http","apiUri", function($http, url){
            return {
                projects: function(){
                    return $http.get(url+"projects");
                },
                project: function(id){
                    return $http.get(url+"projects/"+id);
                }
            };
        }])
        .config(function($routeProvider){
            $routeProvider
                .when("/", {
                    templateUrl : "./views/main.html",
                    controller: "mainController"
                })
        })
        .controller("mainController", ["$scope", "api",function($scope, api){
            api.projects()
                .then(function(res){
                    console.log(res.data);
                    $scope.projects = res.data;
                })
                .catch(function(err){
                    $scope.error = err;
                    console.log(err);
                });
        }]);
})();