(function () {
    angular.module("shipadoc", ["ngRoute"])
        .value("apiUri", "http://localhost:8080/api/")
        .factory("api", ["$http", "apiUri", function ($http, url) {
            return {
                projects: function () {
                    return $http.get(url + "projects");
                },
                project: function (id) {
                    return $http.get(url + "projects/" + id);
                }
            };
        }])
        .config(function ($routeProvider) {
            $routeProvider
                .when("/", {
                    templateUrl: "./views/main.html",
                    controller: "mainController"
                })
                .when("/projects/:id", {
                    templateUrl: "./views/project.html",
                    controller: "projectController"
                });
        })
        .controller("mainController", ["$scope", "api", function ($scope, api) {
            api.projects()
                .then(function (res) {
                    var colsPerRow = 2;
                    $scope.projects = res.data.reduce(function(rows, key, index) {
                        return (index %  colsPerRow === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) && rows;
                    }, []);
                    console.log($scope.projects);
                })
                .catch(function (err) {
                    $scope.error = err;
                    console.log(err);
                });
        }])
        .controller("projectController", ["$scope", "$routeParams", "api", function ($scope, $params, api) {
            api.project($params.id)
                .then(function(res){
                    console.log(res.data);
                    $scope.project = res.data;
                })
                .catch(function(err){
                    console.log(err);
                })
        }
        ]);
})();