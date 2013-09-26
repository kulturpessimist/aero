/*

Application

*/

angular.module('aero', ['aero.controllers','aero.services','aero.directives','aero.filters','ui.event'])
	.config(['$routeProvider', function($routeProvider) {
		/*
		$routeProvider.
			when( '/phones', { templateUrl: 'partials/phone-list.html',   controller: PhoneListCtrl } ).
			when( '/phones/:phoneId', {templateUrl: 'partials/phone-detail.html', controller: PhoneDetailCtrl}).
			otherwise( { redirectTo: '/phones' } );
		*/
	}]);

/*

Controllers

*/

angular.module('aero.controllers', [])
	.controller('Stream', function($scope,twitter,marker){
		$scope.twitter = twitter;
		$scope.marker = { 'home':0 };
		$scope.oauth_token = localStorage.getItem('oauth_token');
		$scope.oauth_token_secret = localStorage.getItem('oauth_token_secret');
		
		$scope.pin = "";
		$scope.active = 'home';

		$scope.user = {};
		$scope.lists = [];
		$scope.tweets = [];
		//
		$scope.showLoginFormular = false;
		//
		$scope.request_authorization = function(){
			$scope.twitter.__call(
				"oauth_requestToken",
				{ oauth_callback: "oob" },
				function (reply) {
					console.log('reply',reply);
					console.log('twitter',$scope.twitter);

					$scope.twitter.setToken(reply.oauth_token, reply.oauth_token_secret);
					// gets the authorize screen URL
					$scope.twitter.__call(
						"oauth_authorize",
						{},
						function (auth_url) {
							window.codebird_auth = window.open(auth_url);
						}
					);
				}
			);
		};
		$scope.authorization_pin_entered = function(){
			$scope.twitter.__call(
				"oauth_accessToken",
				{ oauth_verifier: $scope.pin },
				function (reply) {
					// if you need to persist the login after page reload,
					// consider storing the token in a cookie or HTML5 local storage
					localStorage.setItem('oauth_token', reply.oauth_token);
					localStorage.setItem('oauth_token_secret', reply.oauth_token_secret);
					$scope.twitter.setToken(reply.oauth_token, reply.oauth_token_secret);
					$scope.verify_credentials();
				}
			);
		};
		$scope.verify_credentials = function(){
			$scope.twitter.__call(
				"account_verifyCredentials",
				{	}, //skip_status: true
				function (reply) {
					$scope.$apply(function(){
						console.log('verify credentials', reply);
						$scope.user = reply;
						// load tweetmarker
						marker($scope.user.screen_name, function(id){
							$scope.marker.home = id;
							// all the stuff...
							$scope.loadLists();
							$scope.loadTweets();
							/*$scope.reloadInterval = setInterval(function(){
								$scope.loadTweets();
							}, 3*60*1000);*/
						});
					});
				}
			);
		};
		$scope.initialize = function(){
			console.warn('initialize');
			console.log('oauth', $scope.oauth_token, $scope.oauth_token_secret);
			if( $scope.oauth_token!==null && $scope.oauth_token_secret!==null ){
				$scope.twitter.setToken($scope.oauth_token, $scope.oauth_token_secret);
				$scope.verify_credentials();
			}else{
				$scope.showLoginFormular = true;
			}
		}
		
		$scope.loadLists = function(){
			$scope.twitter.__call(
				"lists_list",
				{},
				function (reply) {
					$scope.$apply(function(){
						console.log('lists', reply);
						reply.pop();
						$scope.lists = reply;
						for(var i in $scope.lists){
							$scope.marker[String($scope.lists[i].id)] = 1;
						}
					});
				}
			);
		}
		$scope.loadTweets = function(){
			$scope.twitter.__call(
				"statuses_homeTimeline",
				{ count:200, since_id: $scope.marker.home },
				function (reply) {
					$scope.$apply(function(){
						console.log('tweets', reply);
						reply.pop();
						$scope.marker.home = reply[0].id;
						$scope.active = 'home';
						$scope.tweets = reply;
					});
				}
			);
		}
		$scope.loadListTweets = function(listId){
			$scope.twitter.__call(
				"lists_statuses",
				{ count:200, since_id: $scope.marker[String(listId)], list_id: listId },
				function (reply) {
					$scope.$apply(function(){
						console.log('list tweets',listId, reply);
						reply.pop();
						for(var i in reply){
							reply[i].listId = listId;
						}
						$scope.active = listId;
						$scope.marker[listId] = reply[0].id;
						$scope.tweets = reply;
					});
				}
			);
		}
		
		$scope.marked = function(id){
			if( $scope.marker[$scope.active] == id ){
				return "label-info";
			}else{
				return "";
			}
		}
		$scope.initialize();
	});
	
/*

Directives

*/
angular.module('aero.directives', [])
	.directive('flatTweet', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: { tweet: '@' },
			template: '<div class="tweet panel color turquoise">{{$scope.$id}}<div class="row"><div class="col-1"><img class="img-rounded" src="http://lorempixel.com/64/64/"></div><div class="col-11"><h6>{{tweet.user.name}} <small>‏@mspro</small><span class="label pull-right">9m</span></h6><p>ohne web keine öffentlichkeit. (achja, öffentlichkeit fandet ihr ja schon immer doof.)</p></div></div></div>',
			link: function($scope, element, attr, ctrl) {
			}
		};
	})

/*

Services

*/

angular.module('aero.services', [])
	.factory('twitter', function($log) {
		var cb			= new Codebird;
		cb.setConsumerKey("qXgECN9jqhaZgVoRmq7Y0A", "7DbWeQxH2gGJLaClQtw8eyAXm5VCApHnqwoIejZjU");
		cb.setProxy("https://codebird-cors-proxy.eu01.aws.af.cm/");
		return cb;
	})
	.factory('marker', function($http){
		return function(username, onSuccess){
			$http({
				method: 'GET',
				url: 'http://tweetmarker-cors-proxy.eu01.aws.af.cm/v2/lastread',
				params:{
					"api_key": "AE-E1868F0EAE44",
					"username": username
				}})
				.success(function(data, status, headers, config){
					console.log('tweetmarker',data);
					onSuccess(data.timeline.id);
				});
		}
	});
	
/*

Filters

*/

angular.module('aero.filters', [])
	.filter('ago', function(){
		return function(time){
			return moment(time).fromNow();;
		}
	});

	
	/*
	
	$('#login').click(function(){
		cb.__call(
			"oauth_requestToken",
			{oauth_callback: "oob"},
			function (reply) {
				// stores it
				cb.setToken(reply.oauth_token, reply.oauth_token_secret);
				// gets the authorize screen URL
				cb.__call(
					"oauth_authorize",
					{},
					function (auth_url) {
						window.codebird_auth = window.open(auth_url);
					}
				);
			}
		);
	});
	$('#pin').blur(function(){
		cb.__call(
			"oauth_accessToken",
			{ oauth_verifier: $('#pin').val() },
			function (reply) {
				// if you need to persist the login after page reload,
				// consider storing the token in a cookie or HTML5 local storage
				localStorage.setItem('oauth_token',reply.oauth_token);
				localStorage.setItem('oauth_token_secret',reply.oauth_token_secret);
				$('#load').click();
			}
		);
	});
	$('#load').click(function(){
		// store the authenticated token, which may be different from the request token (!)
		var oauth_token = localStorage.getItem('oauth_token');
		var oauth_token_secret = localStorage.getItem('oauth_token_secret');
		cb.setToken(oauth_token, oauth_token_secret);
		// loadTimeLine
		cb.__call(
			"statuses_homeTimeline",
			{},
			function (reply) {
				$('.panel').html('<p class="lead">Updated... '+(new Date().toLocaleTimeString())+"</p>");
				console.log(reply);
				for(var i in reply){
					attachTweet(reply[i]);
				}
			}
		);
		// loadLists
		cb.__call(
			"lists_list",
			{},
			function (reply) {
				$('.list-group').html('');
				console.log(reply);
				for(var i in reply){
					attachList(reply[i]);
				}
			}
		);
	});
*/