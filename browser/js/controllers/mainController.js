'use strict';

app.controller('MainCtrl', function($scope, $http) {
	
	const audio = document.createElement('audio');

	$scope.shuffledOrder = [];
	$scope.currentTime = audio.currentTime;

	$scope.togglePlay = (id, index, autoplay) => {

		// if playing/pausing current song
		if ($scope.currentSong === id){
			$scope.playing ? audio.pause() : audio.play();
			$scope.playing = !$scope.playing;
		}
		// if putting on a new song
		else {
			audio.src = `/api/songs/${id}.audio`;
			audio.load();
			if (autoplay) {
				audio.play();
				$scope.playing = true;
			}
			$scope.currentSong = id;
			$scope.currentIndex = index;
		}

		if ($scope.playing) {
			$scope.countdown = setInterval(() => {
				$scope.currentTime++;
			}, 1000);
		} else clearInterval($scope.countdown);

	};

	$scope.backToBeginning = () => {
		$scope.progress = $scope.currentTime = audio.currentTime = 0;
		clearInterval($scope.countdown);
	}

	$scope.getNext = (index) => {
		$scope.backToBeginning();

		var nextSong;
		// shuffle off
		if (!$scope.shuffledOrder.length) {
			if (index === $scope.album.songs.length - 1) index = -1;
			nextSong = $scope.album.songs[index+1];
		}
		// shuffle on
		else {
			const shuffledIndices = $scope.shuffledOrder.map(song => song.index);
			console.log(shuffledIndices);
			let indexInShuffledIndices = shuffledIndices.indexOf($scope.currentIndex);
			if (indexInShuffledIndices === shuffledIndices.length - 1) indexInShuffledIndices = -1;
			nextSong = $scope.shuffledOrder[indexInShuffledIndices+1];

		}
		$scope.togglePlay(nextSong._id, nextSong.index, $scope.playing);
	};

	$scope.getPrevious = (index) => {
		const timeStopped = $scope.currentTime;
		$scope.backToBeginning();
		if (timeStopped > 5) return;

		var previousSong;
		// shuffle off
		if (!$scope.shuffledOrder.length) {
			if (index === 0) index = $scope.album.songs.length;
			previousSong = $scope.album.songs[index-1];
		}
		// shuffle on
		else {
			const shuffledIndices = $scope.shuffledOrder.map(song => song.index);
			console.log(shuffledIndices);
			let indexInShuffledIndices = shuffledIndices.indexOf($scope.currentIndex);
			if (indexInShuffledIndices === 0) indexInShuffledIndices = shuffledIndices.length;
			previousSong = $scope.shuffledOrder[indexInShuffledIndices-1];
		}
		$scope.togglePlay(previousSong._id, previousSong.index, $scope.playing);		
	};


	$scope.toggleShuffle = () => {
		// if shuffledOrder is full (i.e. shuffle is on)
		if ($scope.shuffledOrder.length) {
			$scope.shuffledOrder = [];
		}
		// if shuffledOrder is empty (i.e. shuffle is off)
		else {
			let songList = $scope.album.songs.slice();
			$scope.shuffledOrder.push(songList.splice($scope.currentIndex, 1)[0]);
			while (songList.length) {
				let rn = Math.floor(Math.random() * songList.length);
				$scope.shuffledOrder.push(songList.splice(rn, 1)[0]);
			}
			// console.log($scope.shuffledOrder.map(a => a.index));
		}

	};

	$scope.scrub = (e) => {
		let pxFromLeft = e.clientX - $('.progress').offset().left,
			progressWidth = $('.progress').width(),
			percentFromLeft = pxFromLeft / progressWidth;

		$scope.currentTime = audio.currentTime = audio.duration * percentFromLeft;

	}



	$http.get('/api/albums/56579d1b3b4cc13806ed36fe')
		.then(album => {
			$scope.album = album.data;
			console.log($scope.album);

			$scope.album.songs.forEach((song, i) => {
				song.artists = song.artists.map(a => $scope.album.artists.find(artist => artist._id === a))[0];
				song.index = i;
			});

			$scope.album.imageUrl = `/api/albums/${$scope.album._id}.image`;
		})

	document.addEventListener('keydown', e => {
		if (e.keyCode === 32) {
			e.preventDefault();
			document.getElementById('footer-play').click();
		}
		else if (e.keyCode === 37) {
			e.preventDefault();
			document.getElementById('footer-previous').click();
		}
		else if (e.keyCode === 39) {
			e.preventDefault();
			document.getElementById('footer-next').click();
		}
	})

	audio.addEventListener('ended', () => {
		$scope.getNext($scope.currentIndex);
	});

	audio.addEventListener('timeupdate', function() {
		$scope.progress = 100 * audio.currentTime / audio.duration;
		$scope.currentTime = audio.currentTime;
		$scope.$digest();
	})



});

app.filter('secondsToTime', function() {
	return seconds => new Date(1970, 0, 1).setSeconds(seconds);
});