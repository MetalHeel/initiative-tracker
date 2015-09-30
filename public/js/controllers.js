"use strict";

var initiativeTracker = angular.module('initiativeTracker', []);

initiativeTracker.controller('BattleCtrl', function ($scope, $http) {
	$http.post('battles', {}).success(function(data) {
		var battle_names = [];

		for(var key in data)
			battle_names.push(data[key]);

		$scope.battles = battle_names;

		if($scope.battles.length > 0)
		{
			$scope.battle = $scope.battles[0];
			$scope.combatants = [];

			$http.post('get', {"battle":$scope.battles[0]}).success(function(data) {
				for(key in data.participants)
					$scope.combatants.push(data.participants[key]);
			});
		}
	});

	$scope.addBattle = function(battle) {
		$http.post('add-battle', {"battle":battle}).success(function(data) {
			$scope.battle = battle;
			$scope.battles.push(battle);
		});
	};

	$scope.addCharacter = function(battles, battle, name, race, dd_class, ac) {
		var input = {
			"battle":battle,
			"participants":{}
		};

		var counter = 1;

		for(var i = 0; i < battles.length; i++)
		{
			if(battles[i] == battle)
			{
				for(var key in battles[i].participants)
					counter++;

				input.participants["participant" + counter.toString()] = {
					"name":name,
					"race":race,
					"class":dd_class,
					"ac":ac,
					"initiative":"1"
				};

				$http.post('add', input);

				$http.post('get', {"battle":battle}).success(function(data) {
					while($scope.combatants.length > 0)
						$scope.combatants.pop();
					for(key in data.participants)
						$scope.combatants.push(data.participants[key]);
				});

				break;
			}
		}
	};

	$scope.battleChanged = function(battle) {
		$http.post('get', {"battle":battle}).success(function(data) {
			while($scope.combatants.length > 0)
				$scope.combatants.pop();
			for(key in data.participants)
				$scope.combatants.push(data.participants[key]);
		});
	};2

	$scope.sortByInitiative = function(combatants) {
		var combatants_arr = [];

		for(var key in combatants)
		{
			var inserted = false;

			for(var i = 0; i < combatants_arr.length; i++)
			{
				if(parseInt(combatants[key].initiative) > parseInt(combatants_arr[i].initiative))
				{
					combatants_arr.splice(i, 0, combatants[key]);
					inserted = true;
					break;
				}
			}

			if(!inserted)
				combatants_arr.push(combatants[key]);
		}

		$scope.combatants = combatants_arr;
	};

	$scope.nextInLine = function(combatants) {
		var removed = combatants.shift();
		combatants.push(removed);
		$scope.combatants = combatants;
	};

	$scope.new_race = "human";
	$scope.new_class = "fighter";
});