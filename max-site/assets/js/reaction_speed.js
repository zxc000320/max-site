let $screen = document.querySelector('#screen')
let $result = document.querySelector('#result')

let startTime;
let endTime;
const records = [];
let try_count = 1;
let try_score = [];
let timeoutId;

function Reaction_Speed_game(){
	Reaction_Speed_off();
	$screen.innerHTML = "<br><br><br><br><br>클릭해서 시작하세요.<br>시작 이후 초록이 되면 클릭하세요.";
	$result.innerHTML = "현재 : --- 초, 평균 : ---초"
	$screen.classList.remove('waiting', 'ready', 'miss', 'now');
	$screen.classList.add('waiting');
	$screen.addEventListener('click', click_event);
};

function click_event (event){
		if (event.target.classList.contains('waiting')) { //파랑
			console.log('ready');
			$screen.classList.remove('waiting');
			$screen.classList.add('ready');
			$screen.innerHTML = "<br><br><br><br><br>초록 화면이 되면 클릭하세요";
			timeoutId = setTimeout(() => { // 일정 시간이 넘어가면 초록화면으로 넘어가기 함수
				startTime = new Date();
				console.log('now');
				$screen.classList.remove('ready');
				$screen.classList.add('now');
				$screen.innerHTML = "<br><br><br><br><br>지금 클릭하세요!!";
			}, Math.floor(Math.random() * 1000) + 4000); // 2~4초 사이 랜덤
		} else if (event.target.classList.contains('ready')){ //빨강
			console.log('miss');
			clearTimeout(timeoutId);
			$screen.classList.remove('ready');
			$screen.classList.add('miss');
			$screen.innerHTML = "<br><br><br><br><br>초록 화면이 되면!! 클릭하세요!!!!";
		} else if (event.target.classList.contains('miss')){ //회색
			console.log('waiting');
			clearTimeout(timeoutId);
			$screen.classList.remove('miss');
			$screen.classList.add('waiting');
			$screen.innerHTML = "<br><br><br><br><br>클릭해서 다시 시작하세요";
		} else if (event.target.classList.contains('now')){ //초록
			console.log('waiting');
			endTime = new Date();
			const current = endTime - startTime;
			records.push(current);
			const average = records.reduce((a, c) => a + c) / records.length;
			try_score.push(`${try_count}번째 : ${(current.toFixed(0))/1000} 초 <br>`);//매 시도할때마다 점수
			$result.innerHTML = `현재 : ${(current.toFixed(0))/1000} 초, 평균 : ${(average.toFixed(0))/1000} 초 <br>${try_score}`;
			startTime = null;
			endTime = null;
			$screen.classList.remove('now');
			$screen.classList.add('waiting');
			$screen.innerHTML = "<br><br><br><br><br>클릭해서 시작하세요";
			try_count++;
		}
	}

function Reaction_Speed_off(){
	startTime = null;
	endTime = null;
	records.length = 0;
	try_count = 1;
	try_score.length = 0;
	clearTimeout(timeoutId);
	$screen.innerHTML = "<br><br><br><br><br>클릭해서 시작하세요.<br>시작 이후 초록 화면이 되면 클릭하세요.";
	$result.innerHTML = "현재 : --- 초, 평균 : ---초"
	$screen.classList.remove('waiting', 'ready', 'miss', 'now');
	$screen.classList.add('waiting');
	$screen.removeEventListener('click', click_event);
};