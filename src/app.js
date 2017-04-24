(function () {
    'use strict';

    angular.module('app', []);

    angular.module('app').factory('speech', function () {
        var speech = {};

        speech.spell = function (phrase) {
            var voiceList = responsiveVoice.getVoices();
            voiceList = voiceList.slice(0, 3);
            voiceList = voiceList.map(function (voice) {
                return voice.name
            });
            var randomVoice = voiceList[Math.floor(Math.random() * voiceList.length)];
            var rate = Math.random() * (0.75 - 0.8) + 0.8
            var pitch = Math.random() * (0.9 - 1.1) + 1.1
            var readSlower = Math.random() >= 0.5;
            var voiceConfig = {
                pitch: pitch,
                rate: rate,
                volume: 1
            }
            var replacePattern = "$1...";
            if (readSlower) {
                replacePattern = "$1..."
            }

            var letters = phrase.replace(new RegExp(/([a-zA-Z])/g), replacePattern);
            responsiveVoice.speak(letters, randomVoice, voiceConfig);
        }

        return speech;

    });

    angular.module('app').factory('dictionary', function ($http) {
        var dictionary = {};

        dictionary.define = function (word) {
            return $http.get("https://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=" + word + "&apikey=GgGINxAbzViuoKA7GDuXBsejACsuCTHq")
                .then(function (results) {
                    var definitions = results.data.results;
                    if (definitions.length > 0) {
                        return definitions[0].senses[0].definition[0];
                    }
                    else{
                        return "";
                    }
                })
        }
        return dictionary;
    })

    angular.module('app').directive('myEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    angular.module('app').controller("voiceController", voiceController);

    voiceController.$inject = ['speech', '$http', 'dictionary', '$timeout'];
    function voiceController(speech, $http, dictionary, $timeout) {
        var vm = this;
        vm.minLength = 4;
        vm.maxLength = 4;
        vm.answer = "";
        vm.words = [];

        vm.define = function (word) {
            dictionary.define(word).then(function (definition) {
                vm.definition = definition;
            });
        }

        $http.get('words.txt').then(function (response) {
            vm.words = response.data.split("\r\n")
            vm.nextWord();
        });

        vm.replay = function () {
            speech.spell(vm.answer);
        }
        vm.reveal = function () {
            vm.revealead = !vm.revealead;
        }

        vm.nextWord = function () {
            vm.definition = "";
            vm.answer = vm.words[Math.floor(Math.random() * vm.words.length)];

            if (vm.answer.length > vm.maxLength || vm.answer.length < vm.minLength) {
                vm.nextWord();
            }
            else {
                speech.spell(vm.answer);
                console.log(vm.answer);
                
                vm.value = "";
                vm.revealead = false;
                $timeout(function(){
                    vm.revealead = true;
                    vm.define(vm.answer);
                },4000);
            }
        }

    }

})();