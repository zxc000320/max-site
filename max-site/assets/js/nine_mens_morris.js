Nine_Mens_Morris_table = document.getElementById('Nine_Mens_Morris_table');

player1 = hm = '○';
player2 = ai = '●';

var turn = player1;

var Nine_Mens_Morris_board = ['_'] * 49;

Nine_Mens_Morris_vs_ai = document.getElementById('Nine_Mens_Morris_ai');
Nine_Mens_Morris_vs_hm = document.getElementById('Nine_Mens_Morris_hm');

function check_win(b) {
    winner = '';
    marker = 5;
    if (marker <= 2) {
        winner = b;
    }

    if (winner != '') {
        return [true, winner];
    }
    if (winner == '') {
        return [false, ''];
    }
}

let Nine_Mens_Morris_turn_count = 0;
let count_player1_marker = 9,
    count_player2_marker = 9;

function mark_and_changr_turn(i) {
    document.getElementById(i).innerHTML = turn;

    if (turn == player1) {
        turn = player2;
    } else {
        turn = player1;
    }
    Nine_Mens_Morris_turn_count++;
}

function click_cell_17(event, i) {
    var cell_17_id = event.target.id;
    console.log(event);

    document.getElementById(i).innerHTML = '';
    return false;
}

function mark_and_changr_turn_and_move_marker(event, i) {
    //돌옮기기 구현
    if (turn == player1) {
        document.getElementById(i).innerHTML = '☆';

        for (let click_count = 0; click_count < 1; ) {
            click_cell_17(event, i);
            if ((click_cell_17.return = true)) {
                click_count++;
            }
        }

        turn = player2;
    } else {
        document.getElementById(i).innerHTML = '★';

        for (let click_count = 0; click_count < 1; ) {
            click_cell_17(event, i);
            if ((click_cell_17 = true)) {
                click_count++;
            }
        }

        turn = player1;
    }
    Nine_Mens_Morris_turn_count++;
}

function click_cell(event) {
    var cell_id = event.target.id;

    console.log(event.target);
    console.log(cell_id);

    if (document.getElementById(cell_id).innerHTML == '' && Nine_Mens_Morris_turn_count <= 17) {
        mark_and_changr_turn(cell_id);
        // if (Nine_Mens_Morris_vs_ai.checked && turn == ai && turn != winner){
        // ai_turn();
        // }
    } else if (
        document.getElementById(cell_id).innerHTML == turn &&
        Nine_Mens_Morris_turn_count > 17
    ) {
        mark_and_changr_turn_and_move_marker(event, cell_id);
    }
    Nine_Mens_Morris_print_turn_massage();
}

function Nine_Mens_Morris_tiles() {
    let f = 0;
    for (let i = 0; i < 7; i++) {
        Nine_Mens_Morris_tr = document.createElement('Nine_Mens_Morris_tr');
        for (let j = 0; j < 7; j++) {
            Nine_Mens_Morris_td = document.createElement('Nine_Mens_Morris_td');
            f = i * 7 + j;
            Nine_Mens_Morris_td.id = 'Nine_Mens_Morris_' + f;
            Nine_Mens_Morris_td.addEventListener('click', (e) => click_cell(event));
            Nine_Mens_Morris_tr.appendChild(Nine_Mens_Morris_td);
        }
        Nine_Mens_Morris_table.appendChild(Nine_Mens_Morris_tr, (type = 'text'));
    }

    document.getElementById('Nine_Mens_Morris_' + 1).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 2).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 4).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 5).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 7).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 9).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 11).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 13).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 14).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 15).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 19).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 20).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 24).innerHTML = '■';
    document.getElementById('Nine_Mens_Morris_' + 28).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 29).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 33).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 34).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 35).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 37).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 39).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 41).innerHTML = '│';
    document.getElementById('Nine_Mens_Morris_' + 43).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 44).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 46).innerHTML = '─';
    document.getElementById('Nine_Mens_Morris_' + 47).innerHTML = '─';
}

var winner = '';
Nine_Mens_Morris_print_turn = document.getElementById('Nine_Mens_Morris_print_turn');
function Nine_Mens_Morris_print_turn_massage() {
    [true_and_false, winner] = check_win(Nine_Mens_Morris_board);

    if (winner != '') {
        Nine_Mens_Morris_print_turn.innerHTML =
            winner + '승리!! ' + Nine_Mens_Morris_turn_count + '턴!';
    } else {
        Nine_Mens_Morris_print_turn.innerHTML =
            turn + '의 차례! ' + Nine_Mens_Morris_turn_count + '턴!';
    }
}

function Nine_Mens_Morris_restart_button() {
    turn = player1;

    for (let k = 0; k < 49; k++) {
        cell = document.getElementById(k);
        cell.innerHTML = null;
        board[k] = '_';
    }

    Nine_Mens_Morris_game();
}

function Nine_Mens_Morris_game() {
    Nine_Mens_Morris_tiles();

    Nine_Mens_Morris_print_turn_massage();
}

Nine_Mens_Morris_game();