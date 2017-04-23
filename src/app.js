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
            var rate = Math.random() * (0.8 - 1.1) + 1.1
            var pitch = Math.random() * (0.9 - 1.1) + 1.1
            var readSlower = Math.random() >= 0.5;
            var voiceConfig = {
                pitch: pitch,
                rate: rate,
                volume: 1
            }
            var replacePattern = "$1.";
            if (readSlower) {
                replacePattern = "$1..."
            }

            var letters = phrase.replace(new RegExp(/([a-zA-Z])/g), replacePattern);
            responsiveVoice.speak(letters, randomVoice, voiceConfig);
        }

        return speech;

    });

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

    voiceController.$inject = ['speech', '$http'];
    function voiceController(speech, $http) {
        var vm = this;
        vm.minLength = 3;
        vm.maxLength = 7;
        vm.answer = "";
        vm.words = [];

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
            vm.answer = vm.words[Math.floor(Math.random() * vm.words.length)];

            if (vm.answer.length > vm.maxLength || vm.answer.length < vm.minLength) {
                vm.nextWord();
            }
            else {
                speech.spell(vm.answer);
                console.log(vm.answer);
                vm.value = "";
                vm.revealead = false;
            }
        }

        // vm.nextWord = function () {
        //     var numberOfLetters = Math.floor(Math.random() * (7 - 3)) + 3;
        //     $http.get("http://www.setgetgo.com/randomword/get.php?len=" + numberOfLetters)
        //         .then(function (result) {
        //             console.log(result.data);
        //             vm.answer = result.data;
        //             speech.spell(vm.answer);
        //             vm.value = "";
        //         })
        // }


    }

})();