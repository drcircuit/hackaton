(function () {
    function createProgress(progress, element, radius){
        var colors = {
            'pink': '#E1499A',
            'yellow': '#f0ff08',
            'green': '#32e4dd'
        };

        var color = colors.green;

        var radius = radius || 50;
        var border = 5;
        var padding = radius / 2;
        var startPercent = 0;
        var endPercent =progress;


        var twoPi = Math.PI * 2;
        var formatPercent = d3.format('.0%');
        var boxSize = (radius + padding) * 2;


        var count = Math.abs((endPercent - startPercent) / 0.01);
        var step = endPercent < startPercent ? -0.01 : 0.01;

        var arc = d3.arc()
            .startAngle(0)
            .innerRadius(radius)
            .outerRadius(radius - border);

        var parent = d3.select(element);

        var svg = parent.append('svg')
            .attr('width', boxSize)
            .attr('height', boxSize);

        var defs = svg.append('defs');

        var filter = defs.append('filter')
            .attr('id', 'blur');

        filter.append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', '7');

        var g = svg.append('g')
            .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

        var meter = g.append('g')
            .attr('class', 'progress-meter');

        meter.append('path')
            .attr('class', 'background')
            .attr('fill', '#ccc')
            .attr('fill-opacity', 0.5)
            .attr('d', arc.endAngle(twoPi));

        var foreground = meter.append('path')
            .attr('class', 'foreground')
            .attr('fill', color)
            .attr('fill-opacity', 1)
            .attr('stroke', color)
            .attr('stroke-width', 5)
            .attr('stroke-opacity', 1)
            .attr('filter', 'url(#blur)');

        var front = meter.append('path')
            .attr('class', 'foreground')
            .attr('fill', color)
            .attr('fill-opacity', 1);

        var numberText = meter.append('text')
            .attr('fill', '#fff')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em');

        function updateProgress(progress) {
            foreground.attr('d', arc.endAngle(twoPi * progress));
            front.attr('d', arc.endAngle(twoPi * progress));
            numberText.text(formatPercent(progress));
        }

        var progress = startPercent;

        (function loops() {
            updateProgress(progress);

            if (count > 0) {
                count--;
                progress += step;
                setTimeout(loops, 10);
            }
        })();
    }
    angular.module("shipadoc", ["ngRoute"])
        .value("apiUri", "http://localhost:8080/api/")
        .filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }])
        .factory("api", ["$http", "apiUri", function ($http, url) {
            return {
                projects: function () {
                    return $http.get(url + "projects");
                },
                project: function (id) {
                    return $http.get(url + "projects/" + id);
                },
                doctor: function(id){
                    return $http.get(url+"doctors/"+id);
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
                    $scope.project.raised = Number($scope.project.funded).toFixed(2);
                    $scope.project.requested = Number($scope.project.requested).toFixed(2);
                    $scope.progress = Number($scope.project.funded) / Number($scope.project.requested);
                    var converter = new showdown.Converter();
                    $scope.project.description = converter.makeHtml($scope.project.description);
                    createProgress($scope.progress, "div#content", 50);
                })
                .catch(function(err){
                    console.log(err);
                })
        }
        ]);
})();