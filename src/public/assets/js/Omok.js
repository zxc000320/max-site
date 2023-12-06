// 렌주룰 기반으로 구현
// 남은 과제 : 3-3 거짓 금수 판정
// https://github.com/Amustaos5j/gomokuMachine1/blob/master/core2.js
// https://github.com/hsh-game/omok/blob/master/assets/js/AI/core.js
// 오목판에 놓여질 돌
class GoStone {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
    setColor(color) {
        this.color = color;
    }
}

const Omok_canvas = document.getElementById('Omok_canvas');
const status = document.getElementById('Omok_status');
const undoBtn = document.getElementById('Omok_undo');
const Omok_ctx = Omok_canvas.getContext('2d');
const stack = [];
const Omok_board = new Array(16);
for (var i = 0; i < Omok_board.length; i++) {
    Omok_board[i] = new Array(16);
}

const COLOR_NONE = 0;
const COLOR_BLACK = 1;
const COLOR_WHITE = 2;
const COLOR_FORBIDDEN = 3;

// 게임의 진행 여부
let running = true;
// 현재 플레이어의 턴
let turn = COLOR_BLACK;
let Pturn;
let turnCount = 1;

Omok_canvas.addEventListener('click', placeStone);
undoBtn.addEventListener('click', undo);

var AI = document.getElementById('Omok_AI');
var Pl = document.getElementById('Omok_Pl');

if (AI.checked) Pturn = 'AI';
if (Pl.checked) Pturn = 'Player1';

// 게임 초기화
function init() {
    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            Omok_board[y][x] = new GoStone(x, y, COLOR_NONE);
        }
    }
    running = true;
    checkForbidden();
    updateOmok_canvas();
    turn = COLOR_BLACK;
    turnCount = 1;
    updateStatusMsg();
}

// 정해진 좌표에 흑돌을 그림
function drawBlack(x, y) {
    Omok_ctx.fillStyle = 'black';
    Omok_ctx.beginPath();
    Omok_ctx.arc(x * 30, y * 30, 14, 0, Math.PI * 2, true);
    Omok_ctx.fill();
    Omok_ctx.closePath();
}

// 정해진 좌표에 백돌을 그림
function drawWhite(x, y) {
    Omok_ctx.fillStyle = 'white';
    Omok_ctx.strokeStyle = 'black';
    Omok_ctx.lineWidth = 1;
    Omok_ctx.beginPath();
    Omok_ctx.arc(x * 30, y * 30, 14, 0, Math.PI * 2, true);
    Omok_ctx.fill();
    Omok_ctx.stroke();
    Omok_ctx.closePath();
}

// 정해진 좌표에 금수표시를 그림
function drawForbidden(x, y) {
    Omok_ctx.fillStyle = '#DFA450';
    Omok_ctx.strokeStyle = 'red';
    Omok_ctx.lineWidth = 3;
    Omok_ctx.beginPath();
    Omok_ctx.moveTo(x * 30, y * 30 - 14);
    Omok_ctx.lineTo(x * 30 + 14, y * 30 + 14);
    Omok_ctx.lineTo(x * 30 - 14, y * 30 + 14);
    Omok_ctx.lineTo(x * 30, y * 30 - 14);
    Omok_ctx.fill();
    Omok_ctx.stroke();
    Omok_ctx.closePath();
}

// 캔버스에 게임 진행 사항 업데이트
function updateOmok_canvas() {
    Omok_ctx.clearRect(0, 0, Omok_canvas.height, Omok_canvas.width);
    // 바둑판 그리기
    Omok_ctx.fillStyle = 'black';
    Omok_ctx.strokeStyle = 'black';
    Omok_ctx.lineWidth = 1;
    for (let y = 1; y < 15; y++) {
        for (let x = 1; x < 15; x++) {
            Omok_ctx.strokeRect(30 * y, 30 * x, 30, 30);
            // 바둑판 중간중간에 구분점을 그려줌
            if (
                (y == 4 && x == 4) ||
                (y == 4 && x == 12) ||
                (y == 8 && x == 8) ||
                (y == 12 && x == 4) ||
                (y == 12 && x == 12)
            ) {
                Omok_ctx.beginPath();
                Omok_ctx.arc(x * 30, y * 30, 3, 0, Math.PI * 2, true);
                Omok_ctx.fill();
                Omok_ctx.closePath();
            }
        }
    }

    // 오목판에 돌을 그려줌
    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            if (Omok_board[y][x].color == COLOR_BLACK) drawBlack(x, y);
            else if (Omok_board[y][x].color == COLOR_WHITE) drawWhite(x, y);
            // 흑돌 차례일 때만 금수 표시를 그려줌
            else if (turn == COLOR_BLACK && Omok_board[y][x].color == COLOR_FORBIDDEN)
                drawForbidden(x, y);
        }
    }

    if (!running) {
        // 한쪽이 승리한 경우 몇번째 수에 어떤 돌을 놓았는지 출력
        for (let i = 0; i < stack.length; i++) {
            Omok_ctx.font = 'bold 20px sans-serif';
            Omok_ctx.textAlign = 'center';
            Omok_ctx.fillStyle = 'red';
            Omok_ctx.fillText(i + 1, stack[i].x * 30, stack[i].y * 30 + 7);
        }
    }
}

// 턴 상태 메시지 업데이트
function updateStatusMsg() {
    let message = '현재 턴 : ';
    if (AI.checked) Pturn == 'Player' ? (Pturn = 'AI') : (Pturn = 'Player');
    if (Pl.checked) Pturn == 'Player1' ? (Pturn = 'Player2') : (Pturn = 'Player1');
    message += Pturn + ' , ';
    turn == COLOR_BLACK ? (message += '●<br>') : (message += '○<br>');
    message += turnCount + ' 번째 턴입니다.';
    status.innerHTML = message;
}

// 승리 체크 함수 (승리할 시 true 반환)
function checkWin(x, y, color) {
    if (
        checkHori(x, y, color) ||
        checkVert(x, y, color) ||
        checkRtlb(x, y, color) ||
        checkLtrb(x, y, color)
    ) {
        if (color == COLOR_BLACK) {
            message = '흑돌이 ' + turnCount + ' 턴만에 승리하였습니다.<br>';
        } else if (color == COLOR_WHITE) {
            message = '백돌이 ' + turnCount + ' 턴만에 승리하였습니다.<br>';
        }
        status.innerHTML = message;

        return true;
    }

    return false;
}

// 가로로 승리 조건 체크
function checkHori(x, y, color) {
    let cnt_color = 1;

    // 가로 좌 방향 체크
    let _x = x - 1;
    while (true) {
        if (_x == 0) break;
        if (Omok_board[y][_x].color == color) cnt_color += 1;
        else break;
        _x -= 1;
    }

    // 가로 우 방향 체크
    _x = x + 1;
    while (true) {
        if (_x == 16) break;
        if (Omok_board[y][_x].color == color) cnt_color += 1;
        else break;
        _x += 1;
    }

    if (color == COLOR_BLACK && cnt_color == 5) return true;
    if (color == COLOR_WHITE && cnt_color > 4) return true;
    return false;
}

// 세로로 승리 조건 성립
function checkVert(x, y, color) {
    let cnt_color = 1;

    // 세로 상 방향 체크
    let _y = y - 1;
    while (true) {
        if (_y == 0) break;
        if (Omok_board[_y][x].color == color) cnt_color += 1;
        else break;
        _y -= 1;
    }

    // 세로 하 방향 체크
    _y = y + 1;
    while (true) {
        if (_y == 16) break;
        if (Omok_board[_y][x].color == color) cnt_color += 1;
        else break;
        _y += 1;
    }

    if (color == COLOR_BLACK && cnt_color == 5) return true;
    if (color == COLOR_WHITE && cnt_color > 4) return true;
    return false;
}

// / 방향 대각선으로 승리 조건 성립
function checkRtlb(x, y, color) {
    let cnt_color = 1;

    // / 오른쪽 방향 체크
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        if (_x == 16 || _y == 0) break;
        if (Omok_board[_y][_x].color == color) cnt_color += 1;
        else break;
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    _x = x - 1;
    _y = y + 1;
    while (true) {
        if (_x == 0 || _y == 16) break;
        if (Omok_board[_y][_x].color == color) cnt_color += 1;
        else break;
        _x -= 1;
        _y += 1;
    }

    if (color == COLOR_BLACK && cnt_color == 5) return true;
    if (color == COLOR_WHITE && cnt_color > 4) return true;
    return false;
}

// \ 방향 대각선으로 승리 조건 성립
function checkLtrb(x, y, color) {
    let cnt_color = 1;

    // \ 오른쪽 방향 체크
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        if (_x == 16 || _y == 16) break;
        if (Omok_board[_y][_x].color == color) cnt_color += 1;
        else break;
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    _x = x - 1;
    _y = y - 1;
    while (true) {
        if (_x == 0 || _y == 0) break;
        if (Omok_board[_y][_x].color == color) cnt_color += 1;
        else break;
        _x -= 1;
        _y -= 1;
    }

    if (color == COLOR_BLACK && cnt_color == 5) return true;
    if (color == COLOR_WHITE && cnt_color > 4) return true;
    return false;
}

// 금수 체크
function checkForbidden() {
    let forbidden = [];

    // 오목판에 금수 체크가 없도록 초기화
    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            if (Omok_board[y][x].color == COLOR_FORBIDDEN) Omok_board[y][x].setColor(COLOR_NONE);
        }
    }

    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            if (Omok_board[y][x].color == COLOR_NONE) {
                Omok_board[y][x].setColor(COLOR_BLACK);
                // 완전한 오목이 만들어지지 않으면 금수 체크
                if (
                    !checkHori(x, y, COLOR_BLACK) &&
                    !checkVert(x, y, COLOR_BLACK) &&
                    !checkRtlb(x, y, COLOR_BLACK) &&
                    !checkLtrb(x, y, COLOR_BLACK)
                ) {
                    // 열린 3이 2개 이상 있을 시 금수에 추가 (3-3 금수)
                    if (
                        checkOpenHoriSam(x, y) +
                            checkOpenVertSam(x, y) +
                            checkOpenRtlbSam(x, y) +
                            checkOpenLtrbSam(x, y) >=
                        2
                    ) {
                        forbidden.push(new GoStone(x, y, COLOR_FORBIDDEN));
                        if (checkOpenHoriSam(x, y)) console.log(y, x, 'open hori 3');
                        if (checkOpenVertSam(x, y)) console.log(y, x, 'open vert 3');
                        if (checkOpenRtlbSam(x, y)) console.log(y, x, 'open rtlb 3');
                        if (checkOpenLtrbSam(x, y)) console.log(y, x, 'open ltrb 3');
                    }
                    // 4가 2개 이상 있을 시 금수에 추가 (4-4 금수)
                    if (
                        checkHoriSa(x, y) +
                            checkVertSa(x, y) +
                            checkRtlbSa(x, y) +
                            checkLtrbSa(x, y) >=
                        2
                    ) {
                        forbidden.push(new GoStone(x, y, COLOR_FORBIDDEN));
                        if (checkHoriSa(x, y)) console.log(y, x, 'hori 4');
                        if (checkVertSa(x, y)) console.log(y, x, 'vert 4');
                        if (checkRtlbSa(x, y)) console.log(y, x, 'rtlb 4');
                        if (checkLtrbSa(x, y)) console.log(y, x, 'ltrb 4');
                    }
                    // 한 방향으로 중첩된 4가 2개 이상 있을 시 금수에 추가 (4-4 금수)
                    if (
                        checkHoriNestedSa(x, y) ||
                        checkVertNestedSa(x, y) ||
                        checkRtlbNestedSa(x, y) ||
                        checkLtrbNestedSa(x, y)
                    ) {
                        forbidden.push(new GoStone(x, y, COLOR_FORBIDDEN));
                        if (checkHoriNestedSa(x, y)) console.log(y, x, 'hori nested 4');
                        if (checkVertNestedSa(x, y)) console.log(y, x, 'vert nested 4');
                        if (checkRtlbNestedSa(x, y)) console.log(y, x, 'rtlb nested 4');
                        if (checkLtrbNestedSa(x, y)) console.log(y, x, 'ltrb nested 4');
                    }
                    // 6목 이상 만들어질 시 금수에 추가 (장목 금수)
                    if (
                        checkHoriJangmok(x, y) ||
                        checkVertJangmok(x, y) ||
                        checkRtlbJangmok(x, y) ||
                        checkLtrbJangmok(x, y)
                    ) {
                        forbidden.push(new GoStone(x, y, COLOR_FORBIDDEN));
                    }
                }
                Omok_board[y][x].setColor(COLOR_NONE);
            }
        }
    }

    for (let i = 0; i < forbidden.length; i++) {
        Omok_board[forbidden[i].y][forbidden[i].x].setColor(COLOR_FORBIDDEN);
    }
}

// 가로 방향 장목 체크
function checkHoriJangmok(x, y) {
    let cnt_black = 1;

    // 가로 좌 방향 체크
    let _x = x - 1;
    while (true) {
        if (_x == 0) break;
        if (Omok_board[y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x -= 1;
    }

    // 가로 우 방향 체크
    _x = x + 1;
    while (true) {
        if (_x == 16) break;
        if (Omok_board[y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x += 1;
    }

    if (cnt_black > 5) return true;
    return false;
}

// 세로 방향 장목 체크
function checkVertJangmok(x, y) {
    let cnt_black = 1;

    // 세로 상 방향 체크
    let _y = y - 1;
    while (true) {
        if (_y == 0) break;
        if (Omok_board[_y][x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _y -= 1;
    }

    // 세로 하 방향 체크
    _y = y + 1;
    while (true) {
        if (_y == 16) break;
        if (Omok_board[_y][x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _y += 1;
    }

    if (cnt_black > 5) return true;
    return false;
}

// / 방향 장목 체크
function checkRtlbJangmok(x, y) {
    let cnt_black = 1;

    // / 오른쪽 방향 체크
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        if (_x == 16 || _y == 0) break;
        if (Omok_board[_y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    _x = x - 1;
    _y = y + 1;
    while (true) {
        if (_x == 0 || _y == 16) break;
        if (Omok_board[_y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x -= 1;
        _y += 1;
    }

    if (cnt_black > 5) return true;
    return false;
}

// \ 방향 장목 체크
function checkLtrbJangmok(x, y) {
    let cnt_black = 1;

    // \ 오른쪽 방향 체크
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        if (_x == 16 || _y == 16) break;
        if (Omok_board[_y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    _x = x - 1;
    _y = y - 1;
    while (true) {
        if (_x == 0 || _y == 0) break;
        if (Omok_board[_y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x -= 1;
        _y -= 1;
    }

    if (cnt_black > 5) return true;
    return false;
}

// 가로 방향 열린 3 체크
function checkOpenHoriSam(x, y) {
    let cnt_black = 1;
    let cnt_left = 0;
    let cnt_right = 0;
    let cnt_none = 0;

    // 가로 좌 방향 체크
    let prev = Omok_board[y][x];
    let _x = x - 1;
    while (true) {
        cnt_left += 1;
        if (_x == 0) {
            if (Omok_board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        }
        if (Omok_board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (Omok_board[y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        } else if (Omok_board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_left -= 2;
                break;
            }
        }
        prev = Omok_board[y][_x];
        _x -= 1;
    }

    // 가로 우 방향 체크
    prev = Omok_board[y][x];
    _x = x + 1;
    while (true) {
        cnt_right += 1;
        if (_x == 16) {
            if (Omok_board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        }
        if (Omok_board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (Omok_board[y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        } else if (Omok_board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_right -= 2;
                break;
            }
        }
        prev = Omok_board[y][_x];
        _x += 1;
    }

    // 흑돌 갯수가 3이 아니면 열린 3이 아님
    if (cnt_black != 3) return false;
    // 빈 공간을 두 개 이상 가진 경우 열린 3이 아님
    if (cnt_none > 1) return false;
    // 한쪽이라도 벽으로 막힌 경우 열린 3이 아님
    if (x - cnt_left == 1 || x + cnt_right == 15) return false;
    // 상대 돌로 막힌 경우 열린 3이 아님
    if (x - cnt_left - 1 > 0 && Omok_board[y][x - cnt_left - 1].color == COLOR_WHITE) return false;
    if (x + cnt_right + 1 < 16 && Omok_board[y][x + cnt_right + 1].color == COLOR_WHITE)
        return false;
    // 양쪽에 한 칸을 띄고 상대 돌로 막힌 경우 열린 3이 아님
    if (x - cnt_left - 2 > 0 && Omok_board[y][x - cnt_left - 2].color == COLOR_WHITE) {
        if (x + cnt_right + 2 < 16 && Omok_board[y][x + cnt_right + 2].color == COLOR_WHITE)
            return false;
    }
    return true;
}

// 세로 방향 열린 3 체크
function checkOpenVertSam(x, y) {
    let cnt_black = 1;
    let cnt_up = 0;
    let cnt_down = 0;
    let cnt_none = 0;

    // 세로 상 방향 체크
    let prev = Omok_board[y][x];
    let _y = y - 1;
    while (true) {
        cnt_up += 1;
        if (_y == 0) {
            if (Omok_board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        }
        if (Omok_board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (Omok_board[_y][x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        } else if (Omok_board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_up -= 2;
                break;
            }
        }
        prev = Omok_board[_y][x];
        _y -= 1;
    }

    // 세로 하 방향 체크
    prev = Omok_board[y][x];
    _y = y + 1;
    while (true) {
        cnt_down += 1;
        if (_y == 16) {
            if (Omok_board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        }
        if (Omok_board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (Omok_board[_y][x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        } else if (Omok_board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_down -= 2;
                break;
            }
        }
        prev = Omok_board[_y][x];
        _y += 1;
    }

    // 흑돌 갯수가 3이 아니면 열린 3이 아님
    if (cnt_black != 3) return false;
    // 빈 공간을 두 개 이상 가진 경우 열린 3이 아님
    if (cnt_none > 1) return false;
    // 한쪽이라도 벽으로 막힌 경우 열린 3이 아님
    if (y - cnt_up == 1 || y + cnt_down == 15) return false;
    // 상대 돌로 막힌 경우 열린 3이 아님
    if (y - cnt_up - 1 > 0 && Omok_board[y - cnt_up - 1][x].color == COLOR_WHITE) return false;
    if (y + cnt_down + 1 < 16 && Omok_board[y + cnt_down + 1][x].color == COLOR_WHITE) return false;
    // 양쪽에 한 칸을 띄고 상대 돌로 막힌 경우 열린 3이 아님
    if (y - cnt_up - 2 > 0 && Omok_board[y - cnt_up - 2][x].color == COLOR_WHITE) {
        if (y + cnt_down + 2 < 16 && Omok_board[y + cnt_down + 2][x].color == COLOR_WHITE)
            return false;
    }
    return true;
}

// / 방향 열린 3 체크
function checkOpenRtlbSam(x, y) {
    let cnt_black = 1;
    let cnt_upright = 0;
    let cnt_downleft = 0;
    let cnt_none = 0;

    // / 오른쪽 방향 체크
    let prev = Omok_board[y][x];
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        cnt_upright += 1;
        if (_x == 16 || _y == 0) {
            if (_y > 0 && Omok_board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (Omok_board[_y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_upright -= 2;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    prev = Omok_board[y][x];
    _x = x - 1;
    _y = y + 1;
    while (true) {
        cnt_downleft += 1;
        if (_x == 0 || _y == 16) {
            if (Omok_board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (Omok_board[_y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_downleft -= 2;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x -= 1;
        _y += 1;
    }

    // 흑돌 갯수가 3이 아니면 열린 3이 아님
    if (cnt_black != 3) return false;
    // 빈 공간을 두 개 이상 가진 경우 열린 3이 아님
    if (cnt_none > 1) return false;
    // 한쪽이라도 벽으로 막힌 경우 열린 3이 아님
    if (
        y - cnt_upright == 1 ||
        x + cnt_upright == 15 ||
        y + cnt_downleft == 15 ||
        x - cnt_downleft == 1
    )
        return false;
    // 상대 돌로 막힌 경우 열린 3이 아님
    if (
        x + cnt_upright + 1 < 16 &&
        y - cnt_upright - 1 > 0 &&
        Omok_board[y - cnt_upright - 1][x + cnt_upright + 1].color == COLOR_WHITE
    )
        return false;
    if (
        x - cnt_downleft - 1 > 0 &&
        y + cnt_downleft + 1 < 16 &&
        Omok_board[y + cnt_downleft + 1][x - cnt_downleft - 1].color == COLOR_WHITE
    )
        return false;
    // 양쪽에 한 칸을 띄고 상대 돌로 막힌 경우 열린 3이 아님
    if (
        x + cnt_upright + 2 < 16 &&
        y - cnt_upright - 2 > 0 &&
        Omok_board[y - cnt_upright - 2][x + cnt_upright + 2].color == COLOR_WHITE
    ) {
        if (
            x - cnt_downleft - 2 > 0 &&
            y + cnt_downleft + 2 < 16 &&
            Omok_board[y + cnt_downleft + 2][x - cnt_downleft - 2].color == COLOR_WHITE
        )
            return false;
    }

    return true;
}

// \ 방향 열린 3 체크
function checkOpenLtrbSam(x, y) {
    let cnt_black = 1;
    let cnt_downright = 0;
    let cnt_upleft = 0;
    let cnt_none = 0;

    // \ 오른쪽 방향 체크
    let prev = Omok_board[y][x];
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        cnt_downright += 1;
        if (_x == 16 || _y == 16) {
            if (Omok_board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (Omok_board[_y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_downright -= 2;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    prev = Omok_board[y][x];
    _x = x - 1;
    _y = y - 1;
    while (true) {
        cnt_upleft += 1;
        if (_x == 0 || _y == 0) {
            if (Omok_board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (Omok_board[_y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_upleft -= 2;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x -= 1;
        _y -= 1;
    }

    // 흑돌 갯수가 3이 아니면 열린 3이 아님
    if (cnt_black != 3) return false;
    // 빈 공간을 두 개 이상 가진 경우 열린 3이 아님
    if (cnt_none > 1) return false;
    // 한쪽이라도 벽으로 막힌 경우 열린 3이 아님
    if (
        y + cnt_downright == 15 ||
        x + cnt_downright == 15 ||
        y - cnt_upleft == 1 ||
        x - cnt_upleft == 1
    )
        return false;
    // 상대 돌로 막힌 경우 열린 3이 아님
    if (
        x + cnt_downright + 1 < 16 &&
        y + cnt_downright + 1 < 16 &&
        Omok_board[y + cnt_downright + 1][x + cnt_downright + 1].color == COLOR_WHITE
    )
        return false;
    if (
        x - cnt_upleft - 1 > 0 &&
        y - cnt_upleft - 1 > 0 &&
        Omok_board[y - cnt_upleft - 1][x - cnt_upleft - 1].color == COLOR_WHITE
    )
        return false;
    // 양쪽에 한 칸을 띄고 상대 돌로 막힌 경우 열린 3이 아님
    if (
        x + cnt_downright + 2 < 16 &&
        y + cnt_downright + 2 < 16 &&
        Omok_board[y + cnt_downright + 2][x + cnt_downright + 2].color == COLOR_WHITE
    ) {
        if (
            x - cnt_upleft - 2 > 0 &&
            y - cnt_upleft - 2 > 0 &&
            Omok_board[y - cnt_upleft - 2][x - cnt_upleft - 2].color == COLOR_WHITE
        )
            return false;
    }

    return true;
}

// 가로 방향 4 체크
function checkHoriSa(x, y) {
    let cnt_black = 1;
    let cnt_left = 0;
    let cnt_right = 0;
    let cnt_none = 0;

    // 가로 좌 방향 체크
    let prev = Omok_board[y][x];
    let _x = x - 1;
    while (true) {
        cnt_left += 1;
        if (_x == 0) {
            if (Omok_board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        }
        if (Omok_board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[y][_x].color == COLOR_WHITE ||
            Omok_board[y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        } else if (Omok_board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_left -= 1;
                }
                cnt_none -= 1;
                cnt_left -= 1;
                break;
            }
        }
        prev = Omok_board[y][_x];
        _x -= 1;
    }

    // 가로 우 방향 체크
    prev = Omok_board[y][x];
    _x = x + 1;
    while (true) {
        cnt_right += 1;
        if (_x == 16) {
            if (Omok_board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        }
        if (Omok_board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[y][_x].color == COLOR_WHITE ||
            Omok_board[y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        } else if (Omok_board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_right -= 1;
                }
                cnt_none -= 1;
                cnt_right -= 1;
                break;
            }
        }
        prev = Omok_board[y][_x];
        _x += 1;
    }

    // 흑돌 갯수가 4가 아니면 4가 아님
    if (cnt_black != 4) return false;
    return true;
}

// 세로 방향 4 체크
function checkVertSa(x, y) {
    let cnt_black = 1;
    let cnt_up = 0;
    let cnt_down = 0;
    let cnt_none = 0;

    // 세로 상 방향 체크
    let prev = Omok_board[y][x];
    let _y = y - 1;
    while (true) {
        cnt_up += 1;
        if (_y == 0) {
            if (Omok_board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        }
        if (Omok_board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][x].color == COLOR_WHITE ||
            Omok_board[_y][x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        } else if (Omok_board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_up -= 1;
                }
                cnt_none -= 1;
                cnt_up -= 1;
                break;
            }
        }
        prev = Omok_board[_y][x];
        _y -= 1;
    }

    // 세로 하 방향 체크
    prev = Omok_board[y][x];
    _y = y + 1;
    while (true) {
        cnt_down += 1;
        if (_y == 16) {
            if (Omok_board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        }
        if (Omok_board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][x].color == COLOR_WHITE ||
            Omok_board[_y][x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        } else if (Omok_board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_down -= 1;
                }
                cnt_none -= 1;
                cnt_down -= 1;
                break;
            }
        }
        prev = Omok_board[_y][x];
        _y += 1;
    }

    // 흑돌 갯수가 4가 아니면 4가 아님
    if (cnt_black != 4) return false;
    return true;
}

// / 방향 4 체크
function checkRtlbSa(x, y) {
    let cnt_black = 1;
    let cnt_upright = 0;
    let cnt_downleft = 0;
    let cnt_none = 0;

    // / 오른쪽 방향 체크
    let prev = Omok_board[y][x];
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        cnt_upright += 1;
        if (_x == 16 || _y == 0) {
            if (Omok_board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][_x].color == COLOR_WHITE ||
            Omok_board[_y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_upright -= 1;
                }
                cnt_none -= 1;
                cnt_upright -= 1;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    prev = Omok_board[y][x];
    _x = x - 1;
    _y = y + 1;
    while (true) {
        cnt_downleft += 1;
        if (_x == 0 || _y == 16) {
            if (Omok_board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][_x].color == COLOR_WHITE ||
            Omok_board[_y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_downleft -= 1;
                }
                cnt_none -= 1;
                cnt_downleft -= 1;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x -= 1;
        _y += 1;
    }

    // 흑돌 갯수가 4가 아니면 4가 아님
    if (cnt_black != 4) return false;
    return true;
}

// \ 방향 4 체크
function checkLtrbSa(x, y) {
    let cnt_black = 1;
    let cnt_downright = 0;
    let cnt_upleft = 0;
    let cnt_none = 0;

    // \ 오른쪽 방향 체크
    let prev = Omok_board[y][x];
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        cnt_downright += 1;
        if (_x == 16 || _y == 16) {
            if (Omok_board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][_x].color == COLOR_WHITE ||
            Omok_board[_y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_downright -= 1;
                }
                cnt_none -= 1;
                cnt_downright -= 1;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    prev = Omok_board[y][x];
    _x = x - 1;
    _y = y - 1;
    while (true) {
        cnt_upleft += 1;
        if (_x == 0 || _y == 0) {
            if (Omok_board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][_x].color == COLOR_WHITE ||
            Omok_board[_y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_upleft -= 1;
                }
                cnt_none -= 1;
                cnt_upleft -= 1;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x -= 1;
        _y -= 1;
    }

    // 흑돌 갯수가 4가 아니면 4가 아님
    if (cnt_black != 4) return false;
    return true;
}

// 가로 방향 중첩된 4 체크
function checkHoriNestedSa(x, y) {
    let cnt_black = 1;
    let cnt_left = 0;
    let cnt_right = 0;
    let cnt_none = 0;

    // 가로 좌 방향 체크
    let prev = Omok_board[y][x];
    let _x = x - 1;
    while (true) {
        cnt_left += 1;
        if (_x == 0) {
            if (Omok_board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        }
        if (Omok_board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[y][_x].color == COLOR_WHITE ||
            Omok_board[y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        } else if (Omok_board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_left -= 2;
                break;
            }
        }
        prev = Omok_board[y][_x];
        _x -= 1;
    }

    // 가로 우 방향 체크
    prev = Omok_board[y][x];
    _x = x + 1;
    while (true) {
        cnt_right += 1;
        if (_x == 16) {
            if (Omok_board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        }
        if (Omok_board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[y][_x].color == COLOR_WHITE ||
            Omok_board[y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        } else if (Omok_board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_right -= 2;
                break;
            }
        }
        prev = Omok_board[y][_x];
        _x += 1;
    }

    if (cnt_none != 2) return false;

    // ● ●●● ●
    if (cnt_black == 5) {
        if (
            Omok_board[y][x - cnt_left + 1].color == COLOR_NONE &&
            Omok_board[y][x + cnt_right - 1].color == COLOR_NONE
        )
            return true;
        // ●● ●● ●●
    } else if (cnt_black == 6) {
        if (
            Omok_board[y][x - cnt_left + 2].color == COLOR_NONE &&
            Omok_board[y][x + cnt_right - 2].color == COLOR_NONE
        )
            return true;
        // ●●● ● ●●●
    } else if (cnt_black == 7) {
        if (
            Omok_board[y][x - cnt_left + 3].color == COLOR_NONE &&
            Omok_board[y][x + cnt_right - 3].color == COLOR_NONE
        )
            return true;
    }

    return false;
}

// 세로 방향 중첩된 4 체크
function checkVertNestedSa(x, y) {
    let cnt_black = 1;
    let cnt_up = 0;
    let cnt_down = 0;
    let cnt_none = 0;

    // 세로 상 방향 체크
    let prev = Omok_board[y][x];
    let _y = y - 1;
    while (true) {
        cnt_up += 1;
        if (_y == 0) {
            if (Omok_board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        }
        if (Omok_board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][x].color == COLOR_WHITE ||
            Omok_board[_y][x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        } else if (Omok_board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_up -= 2;
                break;
            }
        }
        prev = Omok_board[_y][x];
        _y -= 1;
    }

    // 세로 하 방향 체크
    prev = Omok_board[y][x];
    _y = y + 1;
    while (true) {
        cnt_down += 1;
        if (_y == 16) {
            if (Omok_board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        }
        if (Omok_board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][x].color == COLOR_WHITE ||
            Omok_board[_y][x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        } else if (Omok_board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_down -= 2;
                break;
            }
        }
        prev = Omok_board[_y][x];
        _y += 1;
    }

    if (cnt_none != 2) return false;

    // ● ●●● ●
    if (cnt_black == 5) {
        if (
            Omok_board[y - cnt_up + 1][x].color == COLOR_NONE &&
            Omok_board[y + cnt_down - 1][x].color == COLOR_NONE
        )
            return true;
        // ●● ●● ●●
    } else if (cnt_black == 6) {
        if (
            Omok_board[y - cnt_up + 2][x].color == COLOR_NONE &&
            Omok_board[y + cnt_down - 2][x].color == COLOR_NONE
        )
            return true;
        // ●●● ● ●●●
    } else if (cnt_black == 7) {
        if (
            Omok_board[y - cnt_up + 3][x].color == COLOR_NONE &&
            Omok_board[y + cnt_down + 3][x].color == COLOR_NONE
        )
            return true;
    }

    return false;
}

// / 방향 중첩된 4 체크
function checkRtlbNestedSa(x, y) {
    let cnt_black = 1;
    let cnt_upright = 0;
    let cnt_downleft = 0;
    let cnt_none = 0;

    // / 오른쪽 방향 체크
    let prev = Omok_board[y][x];
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        cnt_upright += 1;
        if (_x == 16 || _y == 0) {
            if (Omok_board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][_x].color == COLOR_WHITE ||
            Omok_board[_y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // / 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_upright -= 2;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    prev = Omok_board[y][x];
    _x = x - 1;
    _y = y + 1;
    while (true) {
        cnt_downleft += 1;
        if (_x == 0 || _y == 16) {
            if (Omok_board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][_x].color == COLOR_WHITE ||
            Omok_board[_y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_downleft -= 2;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x -= 1;
        _y += 1;
    }

    if (cnt_none != 2) return false;

    // ● ●●● ●
    if (cnt_black == 5) {
        if (
            Omok_board[y - cnt_upright + 1][x + cnt_upright - 1].color == COLOR_NONE &&
            Omok_board[y + cnt_downleft - 1][x - cnt_downleft + 1].color == COLOR_NONE
        )
            return true;
        // ●● ●● ●●
    } else if (cnt_black == 6) {
        if (
            Omok_board[y - cnt_upright + 2][x + cnt_upright - 2].color == COLOR_NONE &&
            Omok_board[y + cnt_downleft - 2][x - cnt_downleft + 2].color == COLOR_NONE
        )
            return true;
        // ●●● ● ●●●
    } else if (cnt_black == 7) {
        if (
            Omok_board[y - cnt_upright + 3][x + cnt_upright - 3].color == COLOR_NONE &&
            Omok_board[y + cnt_downleft - 3][x - cnt_downleft + 3].color == COLOR_NONE
        )
            return true;
    }

    return false;
}

// \ 방향 중첩된 4 체크
function checkLtrbNestedSa(x, y) {
    let cnt_black = 1;
    let cnt_downright = 0;
    let cnt_upleft = 0;
    let cnt_none = 0;

    // \ 오른쪽 방향 체크
    let prev = Omok_board[y][x];
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        cnt_downright += 1;
        if (_x == 16 || _y == 16) {
            if (Omok_board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][_x].color == COLOR_WHITE ||
            Omok_board[_y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_downright -= 2;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    prev = Omok_board[y][x];
    _x = x - 1;
    _y = y - 1;
    while (true) {
        cnt_upleft += 1;
        if (_x == 0 || _y == 0) {
            if (Omok_board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        }
        if (Omok_board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (
            Omok_board[_y][_x].color == COLOR_WHITE ||
            Omok_board[_y][_x].color == COLOR_FORBIDDEN
        ) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (Omok_board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        } else if (Omok_board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_upleft -= 2;
                break;
            }
        }
        prev = Omok_board[_y][_x];
        _x -= 1;
        _y -= 1;
    }

    if (cnt_none != 2) return false;

    // ● ●●● ●
    if (cnt_black == 5) {
        if (
            Omok_board[y + cnt_downright - 1][x + cnt_downright - 1].color == COLOR_NONE &&
            Omok_board[y - cnt_upleft + 1][x - cnt_upleft + 1].color == COLOR_NONE
        )
            return true;
        // ●● ●● ●●
    } else if (cnt_black == 6) {
        if (
            Omok_board[y + cnt_downright - 2][x + cnt_downright - 2].color == COLOR_NONE &&
            Omok_board[y - cnt_upleft + 2][x - cnt_upleft + 2].color == COLOR_NONE
        )
            return true;
        // ●●● ● ●●●
    } else if (cnt_black == 7) {
        if (
            Omok_board[y + cnt_downright - 3][x + cnt_downright - 3].color == COLOR_NONE &&
            Omok_board[y - cnt_upleft + 3][x - cnt_upleft + 3].color == COLOR_NONE
        )
            return true;
    }

    return false;
}

// 돌 놓는 함수
function placeStone(event) {
    if (!running) return;

    // 캔버스 상에서의 마우스 클릭 좌표를 획득
    let rect = Omok_canvas.getBoundingClientRect();
    let x = Math.round((event.clientX - rect.left) / 30);
    let y = Math.round((event.clientY - rect.top) / 30);
    if (AI.checked && Pturn == 'AI') AI();
    // 어떤 바둑돌도 놓여지지 않은 위치라면 바둑돌을 놓을 수 있도록 함
    if (x >= 1 && x < 16 && y >= 1 && y < 16) {
        if (Omok_board[y][x].color != COLOR_BLACK && Omok_board[y][x].color != COLOR_WHITE) {
            // 흑돌 차례일 경우 금수 자리에 돌을 놓았을 때 경고 메시지를 출력
            if (turn == COLOR_BLACK && Omok_board[y][x].color == COLOR_FORBIDDEN) {
                status.innerHTML = '해당 자리는 금수입니다.';
                setTimeout(() => updateStatusMsg(), 2000);
            } else {
                Omok_board[y][x].setColor(turn);
                stack.push(new GoStone(x, y, turn));
                // 승리 체크 (한쪽이 승리한 경우 running을 false로 바꿈)
                if ((running = !checkWin(x, y, turn))) {
                    turn == COLOR_BLACK ? (turn = COLOR_WHITE) : (turn = COLOR_BLACK);
                    // 흑돌 차례가 올 때 금수 체크를 함
                    if (turn == COLOR_BLACK) checkForbidden();
                    turnCount += 1;
                    updateStatusMsg();
                }
                updateOmok_canvas();
            }
        } else {
            status.innerHTML = '이미 바둑돌을 놓은 위치입니다.';
            setTimeout(() => updateStatusMsg(), 2000);
        }
    } else {
        status.innerHTML = '바둑돌을 놓을 수 있는 위치가 아닙니다.';
        setTimeout(() => updateStatusMsg(), 2000);
    }
}

// 한 수 무르기
function undo() {
    if (!running) return;

    if (turnCount <= 1) {
        status.innerHTML = '아무것도 안 둔 상태에서는 한 수 무르기를 사용할 수 없습니다.';
    } else {
        let lastStone = stack.pop();
        Omok_board[lastStone.y][lastStone.x].setColor(COLOR_NONE);
        turn == COLOR_BLACK ? (turn = COLOR_WHITE) : (turn = COLOR_BLACK);
        if (turn == COLOR_BLACK) checkForbidden();
        turnCount -= 1;
        updateOmok_canvas();
        updateStatusMsg();
    }
}

// 공수교대 재시작 버튼
function Omok_reset() {
    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            Omok_board[y][x] = new GoStone(x, y, COLOR_NONE);
        }
    }
    running = true;
    checkForbidden();
    updateOmok_canvas();
    turn = COLOR_BLACK;
    if (AI.checked) Pturn == 'AI' ? (Pturn = 'AI') : (Pturn = 'Player');
    if (Pl.checked) Pturn == 'Player2' ? (Pturn = 'Player2') : (Pturn = 'Player1');
    turnCount = 1;
    updateStatusMsg();
}

// AI함수
// function AI() {
// 	s
// 	turn == COLOR_BLACK ? turn = COLOR_WHITE : turn = COLOR_BLACK;
//     // 흑돌 차례가 올 때 금수 체크를 함
//     if (turn == COLOR_BLACK) checkForbidden();
//     turnCount += 1;
//     updateStatusMsg();
// }
/*
  오목 알고리즘

  = 여러 절차에 의해 각 칸마다 고유한 "우선도"를 지니게 된다.
  = 그 우선도가 가장 높은 칸에 착수하도록 하는 방식이다.
  = 만약 최고 우선도인 칸이 여러개일 경우, 무작위로 하나가 선택된다.
*/

//오목판의 오목돌들이 정의된 2차원 배열을 인자로 필요로 한다.
function AI(color, blocks) {
    const half8directions = [
        //8방향의 반쪽.
        //각각의 배열의 첫번째 요소는 X값의 증가량,
        //두번째 요소는 Y값의 증가량으로 방위를 표현함.
        //방향별로 순회하는 알고리즘을 위함인데,
        //한 방향을 처리하면 반대방향도 같이 처리되기 때문.
        [1, -1], // 북동쪽 (오른쪽 위)
        [1, 0], // 동쪽 (오른쪽)
        [1, 1], // 남동쪽 (오른쪽 아래)
        [0, 1], // 남쪽 (아래)
    ];

    let blockAmount = 0,
        priority = Array(15)
            .fill()
            .map(() => Array(15).fill(0)),
        max = -Infinity,
        maxCoords = [],
        reward = [0, 0],
        x,
        y,
        t,
        s,
        nowColor;

    function isMyColor() {
        return nowColor === color;
    }

    function setReward(a, b) {
        reward = isNaN(b) ? [a, a] : [a, b];
    }

    function getReward() {
        //0번은 자신의 돌에 대한 우선도(보상),
        //1번은 상대의 돌에 대한 우선도(보상).
        return isMyColor() ? reward[1] : reward[0];
    }

    function feed(targetX, targetY) {
        if (Array.isArray(targetX)) {
            if (targetX.every(Array.isArray)) targetX.forEach(feed);
            else feed(...targetX);
            return;
        }

        if (priority[targetX] && targetY in priority[targetX])
            priority[targetX][targetY] += getReward();
    }

    //이미 돌이 놓인 곳의 우선도를 음의 무한대로 한다.
    setReward(-Infinity);
    for (x = 0; x < 15; x++)
        for (y = 0; y < 15; y++)
            if (blocks[x][y]) {
                blockAmount++;
                feed(x, y);
            }

    if (blockAmount >= 15 * 15) {
        throw new Error('Block exceeded');
    }

    //금수인 지점의 우선도를 음의 무한대로 한다.
    setReward(-Infinity);
    game.getBanedPosition(color).forEach(feed);

    //놓인 돌이 없거나 1개이면 바둑판 중앙의 우선도를 1000만큼 높힌다.
    if (blockAmount < 2) priority[7][7] += 1000;

    //모든 돌의 8방향에 우선도를 1만큼 높힌다.
    setReward(1);
    for (x = 0; x < 15; x++)
        for (y = 0; y < 15; y++)
            if (blocks[x][y]) for (t = -1; t < 2; t++) for (s = -1; s < 2; s++) feed(x + t, y + s);

    //공격 가능한 2목을 방어 또는 공격한다.
    //양 끝 수의 우선도를 올린다.
    //상대의 돌일 경우 18, 자신의 돌일 경우 20.
    setReward(18, 20);
    for (x = 0; x < 15; x++)
        for (y = 0; y < 15; y++)
            if (blocks[x][y]) {
                //이어진 2목
                //XX{O}OXXX
                nowColor = blocks[x][y];
                for (t = -1; t < 2; t++)
                    for (s = -1; s < 2; s++) {
                        if (
                            (t || s) &&
                            [-1, -2, 2, 3, 4]
                                .map((e) => [x + e * t, y + e * s])
                                .every(([PX, PY]) => game.stone.is(EMPTY, PX, PY)) &&
                            game.stone.is(nowColor, x + t, y + s)
                        )
                            feed(x + 2 * t, y + 2 * s);
                    }
            } else {
                //끊어진 2목
                //XXO{X}OXX
                half8directions.forEach(([DX, DY]) => {
                    if (
                        (nowColor = game.stone.isStone(x + DX, y + DY)) &&
                        game.stone.is(nowColor, x - DX, y - DY) &&
                        [2, 3, -2, -3].every((e) => game.stone.is(EMPTY, x + e * DX, y + e * DY))
                    )
                        feed(x, y);
                });
            }

    //3목을 방어 또는 공격한다.
    //유효한 3목의 양 끝 수의 우선도를 올린다.
    //유효하지 않는 자신의 3목 양쪽의 우선도를 5만큼 올린다.
    //유효한 상대의 돌일 경우 35, 자신의 돌일 경우 30.
    setReward(35, 30);
    for (x = 0; x < 15; x++)
        for (y = 0; y < 15; y++)
            if (blocks[x][y]) {
                //이어진 3목
                //XX{O}OOXX
                nowColor = blocks[x][y];
                half8directions.forEach(([AX, AY]) => {
                    const conditions = [
                        [1, 2]
                            .map((e) => [x + e * AX, y + e * AY])
                            .every(([PX, PY]) => game.stone.is(nowColor, PX, PY, blocks)),

                        [-1, -2, 3, 4]
                            .map((e) => [x + e * AX, y + e * AY])
                            .every(([PX, PY]) => game.stone.is(EMPTY, PX, PY)),
                    ];

                    if (conditions.every((q) => q))
                        feed([
                            [x - AX, y - AY],
                            [x + 3 * AX, y + 3 * AY],
                        ]);
                });
            } else {
                //끊어진 3목
                //XO{X}OOX
                for (t = -1; t < 2; t++)
                    for (s = -1; s < 2; s++) {
                        const getPoint = (e) => [x + e * t, y + e * s];
                        if (
                            (t || s) &&
                            (nowColor = game.stone.isStone(x - t, y - s)) &&
                            [1, 2]
                                .map(getPoint)
                                .every(([PX, PY]) => game.stone.is(nowColor, PX, PY)) &&
                            [-2, 3].map(getPoint).every(([PX, PY]) => game.stone.is(EMPTY, PX, PY))
                        )
                            feed(x, y);
                    }
            }

    //승리 확정수를 방어 또는 공격한다.
    //해당 수의 우선도를 상대일 경우 1500,
    //자신일 경우 99999 만큼 올린다.
    //승리 확정수 방어 1
    setReward(1500, 99999);
    for (x = 1; x < 13; x++)
        for (y = 1; y < 13; y++)
            if (blocks[x][y]) {
                nowColor = blocks[x][y];
                half8directions.forEach(([DX, DY]) => {
                    const getPoint = (e) => [x + e * DX, y + e * DY];
                    if (
                        (t || s) &&
                        [-1, 4].map(getPoint).some(([PX, PY]) => game.stone.is(EMPTY, PX, PY)) &&
                        [1, 2, 3].map(getPoint).every(([PX, PY]) => game.stone.is(nowColor, PX, PY))
                    )
                        feed([
                            [x + 4 * DX, y + 4 * DY],
                            [x - 1 * DX, y - 1 * DY],
                        ]);
                });
            }

    //승리 확정수 방어2
    for (x = 0; x < 15; x++)
        for (y = 0; y < 15; y++)
            if (blocks[x][y]) {
                nowColor = blocks[x][y];
                half8directions.forEach(([DX, DY]) => {
                    let emptyCoord = [-1, -1];
                    if (
                        3 ===
                        [1, 2, 3, 4]
                            .map((e) => [x + e * DX, y + e * DY])
                            .filter(([PX, PY]) => {
                                if (game.stone.is(nowColor, PX, PY)) return true;
                                emptyCoord = [PX, PY];
                                return false;
                            }).length
                    )
                        feed(emptyCoord);
                });
            }

    //우선도가 가장 높은 것들을 찾고, 그중 하나를 무작위로 선택, 반환한다.
    for (x = 0; x < 15; x++)
        for (y = 0; y < 15; y++) {
            if (max < priority[x][y]) {
                max = priority[x][y];
                maxCoords.length = 0;
            }
            if (max <= priority[x][y]) {
                maxCoords.push([x, y]);
            }
        }

    return maxCoords.random();
}

init();