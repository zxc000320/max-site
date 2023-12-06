const $table = document.querySelector('#Minesweeper_table');
const $timer = document.querySelector('#Minesweeper_timer');
const status = document.getElementById('Minesweeper_status');

var beginner = document.getElementById('beginner');
var intermediate = document.getElementById('intermediate');
var expert = document.getElementById('expert');
var master = document.getElementById('master');

let callbackFlag = false;

let grade;
let row;
let cell;
let mine;
const code = {
    nomal: -1,
    guess: -2,
    flag: -3,
    guess_mine: -4,
    flag_mine: -5,
    mine: -6,
    opened: 0,
};
let data;
let opencount;
let starttime;
let interval;
let findminecount;

Minesweeper_Game();

function updateMinesCounter() {
    let message = '총 지뢰 : ';
    let map_size = row * cell - mine;
    let lost_mine = mine - findminecount;
    message +=
        mine +
        '개 중 ' +
        findminecount +
        '개 찾음, ' +
        lost_mine +
        '개 남음 <br>' +
        map_size +
        '개 중 ' +
        opencount +
        '개 오픈';
    status.innerHTML = message;
}

function onRightClick(event) {
    event.preventDefault();
    const target = event.target;
    const rowIndex = target.parentNode.rowIndex;
    const cellIndex = target.cellIndex;
    const cellData = data[rowIndex][cellIndex];
    if (cellData === code.mine) {
        data[rowIndex][cellIndex] = code.guess_mine;
        target.className = 'guess';
        target.textContent = '❓';
    } else if (cellData === code.guess_mine) {
        data[rowIndex][cellIndex] = code.flag_mine;
        target.className = 'flag';
        target.textContent = '🚩';
        findminecount++;
    } else if (cellData === code.flag_mine) {
        data[rowIndex][cellIndex] = code.mine;
        target.className = '';
        target.textContent = '';
        findminecount--;
    } else if (cellData === code.nomal) {
        data[rowIndex][cellIndex] = code.guess;
        target.className = 'guess';
        target.textContent = '❓';
    } else if (cellData === code.guess) {
        data[rowIndex][cellIndex] = code.flag;
        target.className = 'flag';
        target.textContent = '🚩';
        findminecount++;
    } else if (cellData === code.flag) {
        data[rowIndex][cellIndex] = code.nomal;
        target.className = '';
        target.textContent = '';
        findminecount--;
    }
    updateMinesCounter();
}

function onLeftClick(event) {
    const target = event.target;
    const rowIndex = target.parentNode.rowIndex;
    const cellIndex = target.cellIndex;
    const cellData = data[rowIndex][cellIndex];
    if (cellData === code.nomal) {
        openaround(rowIndex, cellIndex);
    } else if (cellData === code.mine) {
        show_mine();
        target.textContent = '💣';
        target.className = 'opened';
        clearInterval(interval);
        callbackFlag = true;
        $table.removeEventListener('contextmenu', onRightClick);
        $table.removeEventListener('click', onLeftClick);
    }
}

function open(rowIndex, cellIndex) {
    if (data[rowIndex]?.[cellIndex] >= code.opened) return;
    const target = $table.children[rowIndex]?.children[cellIndex];
    if (!target) {
        return;
    }
    const count = countmine(rowIndex, cellIndex);
    target.textContent = count || '';
    target.className = 'opened';
    data[rowIndex][cellIndex] = count;

    opencount++;
    updateMinesCounter();
    if (opencount === row * cell - mine) {
        clearInterval(interval);
        callbackFlag = true;
        $table.removeEventListener('contextmenu', onRightClick);
        $table.removeEventListener('click', onLeftClick);
        setTimeout(() => {
            alert('승리! ' + time + '초가 걸렸습니다!');
        }, 0);
    }
    return count;
}

function openaround(rI, cI) {
    setTimeout(() => {
        const count = open(rI, cI);
        if (count === 0) {
            openaround(rI - 1, cI - 1);
            openaround(rI - 1, cI);
            openaround(rI - 1, cI + 1);
            openaround(rI, cI - 1);
            openaround(rI, cI + 1);
            openaround(rI + 1, cI - 1);
            openaround(rI + 1, cI);
            openaround(rI + 1, cI + 1);
        }
    }, 0);
}

function countmine(rowIndex, cellIndex) {
    const mines = [code.mine, code.guess_mine, code.flag_mine];
    let i = 0;
    mines.includes(data[rowIndex - 1]?.[cellIndex - 1]) && i++;
    mines.includes(data[rowIndex - 1]?.[cellIndex]) && i++;
    mines.includes(data[rowIndex - 1]?.[cellIndex + 1]) && i++;
    mines.includes(data[rowIndex][cellIndex - 1]) && i++;
    mines.includes(data[rowIndex][cellIndex + 1]) && i++;
    mines.includes(data[rowIndex + 1]?.[cellIndex - 1]) && i++;
    mines.includes(data[rowIndex + 1]?.[cellIndex]) && i++;
    mines.includes(data[rowIndex + 1]?.[cellIndex + 1]) && i++;
    return i;
}

function Minesweeper_tiles() {
    data = plant_mine();
    data.forEach((row) => {
        const $Minesweeper_tr = document.createElement('tr');
        row.forEach((cell) => {
            const $Minesweeper_td = document.createElement('td');
            $Minesweeper_td.id = 'Minesweeper_td';
            // if (cell === code.mine) {
            // 	$Minesweeper_td.textContent = 'X';
            // }
            $Minesweeper_tr.appendChild($Minesweeper_td);
        });
        $table.appendChild($Minesweeper_tr);
        $table.addEventListener('contextmenu', onRightClick);
        $table.addEventListener('click', onLeftClick);
    });
}

function plant_mine() {
    var candidate = Array(row * cell)
        .fill()
        .map((arr, i) => {
            return i;
        });
    const shuffle = [];
    while (candidate.length > row * cell - mine) {
        const chosen = candidate.splice(Math.floor(Math.random() * candidate.length), 1)[0];
        shuffle.push(chosen);
    }
    const data = [];
    for (let i = 0; i < row; i++) {
        const rowdata = [];
        data.push(rowdata);
        for (let j = 0; j < cell; j++) {
            const celldata = [];
            rowdata.push(code.nomal);
        }
    }
    for (let k = 0; k < shuffle.length; k++) {
        const ver = Math.floor(shuffle[k] / cell);
        const hor = shuffle[k] % cell;
        data[ver][hor] = code.mine;
    }
    return data;
}

function show_mine() {
    const mines = [code.mine, code.guess_mine, code.flag_mine];
    data.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (mines.includes(cell)) {
                $table.children[rowIndex].children[cellIndex].textContent = '💣';
                $table.children[rowIndex].children[cellIndex].className = 'end';
            }
        });
    });
}
let time;
function Minesweeper_Game() {
    if (beginner.checked) {
        grade = 1;
    } else if (intermediate.checked) {
        grade = 2;
    } else if (expert.checked) {
        grade = 3;
    } else if (master.checked) {
        grade = 4;
    }
    row = 5 * grade;
    cell = 6 * grade;
    mine = Math.floor((7 * grade * grade) / 1.5);
    $table.innerHTML = '';
    findminecount = 0;
    opencount = 0;
    starttime = new Date();
    callbackFlag = false;
    interval = setInterval(() => {
        if (!callbackFlag) {
            time = Math.floor((new Date() - starttime) / 1000);
            $timer.textContent = time + '초';
        }
    }, 1000);
    updateMinesCounter();
    Minesweeper_tiles();
}