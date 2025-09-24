const DELAY_AI = 0.2;
const DELAY_END = 2;
const FPS = 30;
var GRID_SIZE = 7;
const HEIGHT = 550;
const WIDTH = HEIGHT * 0.9;
var CELL = WIDTH / (GRID_SIZE + 2);
var STROKE = CELL / 12;
var DOT = STROKE;
var MARGIN = HEIGHT - (GRID_SIZE + 1) * CELL;
const COLOR_BOARD = 'blueviolet';
const COLOR_BOARDER = 'white';
const COLOR_AI = 'crimson';
const COLOR_AI_LIT = 'lightpink';
const COLOR_DOT = 'black';
const COLOR_HM = 'royalblue';
const COLOR_HM_LIT = 'lightsteelblue';
const COLOR_TIE = 'black';
var TEXT_AI = 'AI';
var TEXT_AI_SML = 'AI';
var TEXT_HM = 'Player';
var TEXT_HM_SML = 'YOU';
var TEXT_SIZE_CELL = CELL / 3;
var TEXT_SIZE_TOP = MARGIN / 6;
const TEXT_TIE = '무승부!';
const TEXT_WIN = '승리!!';

const Side = {
    BOT: 0,
    LEFT: 1,
    RIGHT: 2,
    TOP: 3,
};

var canv = document.getElementById('Dot_And_Box_canvas');
canv.height = HEIGHT;
canv.width = WIDTH;
var canvRect = canv.getBoundingClientRect();

var ctx = canv.getContext('2d');
ctx.lineWidth = STROKE;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

var currentCells, player_Turn, squares;
var score_AI, score_HM;
var timeAI, timeEnd;
var loop_count;

Dot_And_Box_Game();

canv.addEventListener('mousemove', highlightGrid);
canv.addEventListener('click', click);

setInterval(loop, 1000 / FPS);

var small = document.getElementById('small');
var nomal = document.getElementById('nomal');
var large = document.getElementById('large');

var one_player = document.getElementById('Dot_And_Box_ai');
var two_player = document.getElementById('Dot_And_Box_hm');

function loop() {
    fix_mouse();
    Dot_And_Box_checked();
    if (loop_count > 0) {
        for (let i = 0; i < GRID_SIZE; i++) {
            squares[i] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                squares[i][j] = new Square(getGridX(j), getGridY(i), CELL, CELL);
            }
        }
        loop_count--;
    }
    drawBoard();
    drawSquares();
    drawGrid();
    drawScores();
    if (one_player.checked) {
        goAI();
    }
}

function Dot_And_Box_checked() {
    if (small.checked) {
        GRID_SIZE = 5;
    }
    if (nomal.checked) {
        GRID_SIZE = 7;
    }
    if (large.checked) {
        GRID_SIZE = 10;
    }
    CELL = WIDTH / (GRID_SIZE + 2);
    STROKE = CELL / 12;
    DOT = STROKE;
    MARGIN = HEIGHT - (GRID_SIZE + 1) * CELL;
    TEXT_SIZE_CELL = CELL / 3;
    TEXT_SIZE_TOP = MARGIN / 6;

    if (one_player.checked) {
        TEXT_AI = 'AI';
        TEXT_AI_SML = 'AI';
        TEXT_HM = 'Player';
        TEXT_HM_SML = 'YOU';
    }
    if (two_player.checked) {
        TEXT_AI = 'Player2';
        TEXT_AI_SML = 'P2';
        TEXT_HM = 'Player1';
        TEXT_HM_SML = 'P1';
    }
}

function click(/** @type {MouseEvent}*/ ev) {
    if (one_player.checked) {
        if (!player_Turn || timeEnd > 0) {
            return;
        }
        selectSide();
    }
    if (two_player.checked) {
        if (timeEnd > 0) {
            return;
        }
        selectSide();
    }
}

function drawBoard() {
    ctx.fillStyle = COLOR_BOARD;
    ctx.strokeStyle = COLOR_BOARDER;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeRect(STROKE / 2, STROKE / 2, WIDTH - STROKE, HEIGHT - STROKE);
}

function drawDOT(x, y) {
    ctx.fillStyle = COLOR_DOT;
    ctx.beginPath();
    ctx.arc(x, y, DOT, 0, Math.PI * 2);
    ctx.fill();
}

function drawGrid() {
    for (let i = 0; i < GRID_SIZE + 1; i++) {
        for (let j = 0; j < GRID_SIZE + 1; j++) {
            drawDOT(getGridX(j), getGridY(i));
        }
    }
}

function drawLine(x0, y0, x1, y1, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function drawScores() {
    let colAI = player_Turn ? COLOR_AI_LIT : COLOR_AI;
    let colHM = player_Turn ? COLOR_HM : COLOR_HM_LIT;
    drawText(TEXT_HM, WIDTH * 0.25, MARGIN * 0.25, colHM, TEXT_SIZE_TOP);
    drawText(score_HM, WIDTH * 0.25, MARGIN * 0.6, colHM, TEXT_SIZE_TOP * 2);
    drawText(TEXT_AI, WIDTH * 0.75, MARGIN * 0.25, colAI, TEXT_SIZE_TOP);
    drawText(score_AI, WIDTH * 0.75, MARGIN * 0.6, colAI, TEXT_SIZE_TOP * 2);

    if (timeEnd > 0) {
        if (score_AI == score_HM) {
            drawText(TEXT_TIE, WIDTH * 0.5, MARGIN * 0.6, COLOR_TIE, TEXT_SIZE_TOP);
        } else {
            let HM_WIN = score_HM > score_AI;
            let color = HM_WIN ? COLOR_HM : COLOR_AI;
            let text = HM_WIN ? TEXT_HM : TEXT_AI;
            drawText(text, WIDTH * 0.5, MARGIN * 0.25, color, TEXT_SIZE_TOP);
            drawText(TEXT_WIN, WIDTH * 0.5, MARGIN * 0.6, color, TEXT_SIZE_TOP);
        }
    }
}

function drawSquares() {
    for (let row of squares) {
        for (let square of row) {
            square.drawSides();
            square.drawFill();
        }
    }
}

function drawText(text, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.font = size + 'px dejavu sans mono';
    ctx.fillText(text, x, y);
}

function getColor(player, light) {
    if (player) {
        return light ? COLOR_HM_LIT : COLOR_HM;
    } else {
        return light ? COLOR_AI_LIT : COLOR_AI;
    }
}

function getText(player, small) {
    if (player) {
        return small ? TEXT_HM_SML : TEXT_HM;
    } else {
        return small ? TEXT_AI_SML : TEXT_AI;
    }
}

function getGridX(col) {
    return CELL * (col + 1);
}

function getGridY(row) {
    return MARGIN + CELL * row;
}

function getValidNeighbourSides(row, col) {
    let sides = [];
    let square = squares[row][col];

    if (!square.sideLeft.selected) {
        if (col == 0 || squares[row][col - 1].numSelected < 2) {
            sides.push(Side.LEFT);
        }
    }
    if (!square.sideRight.selected) {
        if (col == squares[0].length - 1 || squares[row][col + 1].numSelected < 2) {
            sides.push(Side.RIGHT);
        }
    }
    if (!square.sideTop.selected) {
        if (row == 0 || squares[row - 1][col].numSelected < 2) {
            sides.push(Side.TOP);
        }
    }
    if (!square.sideLeft.selected) {
        if (row == squares.length - 1 || squares[row + 1][col].numSelected < 2) {
            sides.push(Side.LEFT);
        }
    }
    return sides;
}

function getOtherSidessquares(row, col) {
    let x, y;
    let square = squares[row][col];
    for (let i = 0; i < squares.length; i++) {
        for (let j = 0; j < squares[0].length; j++) {
            if (squares[i][j].numSelected == 2) {
                if (row != i || col != j) {
                    x = i;
                    y = j;
                }
            }
        }
    }
    return [x, y];
}

function goAI() {
    if (player_Turn || timeEnd > 0) {
        return;
    }

    if (timeAI > 0) {
        timeAI--;
        if (timeAI == 0) {
            selectSide();
        }
        return;
    }

    let options = [];
    options[0] = [];
    options[1] = [];
    options[2] = [];

    for (let i = 0; i < squares.length; i++) {
        for (let j = 0; j < squares[0].length; j++) {
            switch (squares[i][j].numSelected) {
                case 0:
                case 1:
                    let sides = getValidNeighbourSides(i, j);
                    let priority = sides.length > 0 ? 1 : 2;
                    options[priority].push({ square: squares[i][j], sides: sides });
                    break;
                case 2:
                    // let [x, y] = getOtherSidessquares(i, j)
                    // console.log(x, y, i, j);
                    options[2].push({ square: squares[i][j], sides: [] });
                    break;
                case 3:
                    let unothersides = getOtherSidessquares(i, j);
                    options[0].push({ square: squares[i][j], sides: [] });
                    break;
            }
        }
    }

    // console.log(options[0], options[1], options[2]);

    let option;
    if (options[0].length > 0) {
        option = options[0][Math.floor(Math.random() * options[0].length)];
    } else if (options[1].length > 0) {
        option = options[1][Math.floor(Math.random() * options[1].length)];
    } else if (options[2].length > 0) {
        option = options[2][Math.floor(Math.random() * options[2].length)];
    }

    let side = null;
    if (option.sides.length > 0) {
        side = option.sides[Math.floor(Math.random() * option.sides.length)];
    }

    let coords = option.square.getFreeSideCoords(side);
    highlightSide(coords.x, coords.y);

    timeAI = Math.ceil(DELAY_AI * FPS);
}

function highlightGrid(/** @type {MouseEvent}*/ ev) {
    if (one_player.checked) {
        if (!player_Turn || timeEnd > 0) {
            return;
        }
    }
    if (two_player.checked) {
        if (timeEnd > 0) {
            return;
        }
    }

    let x = ev.clientX - canvRect.left;
    let y = ev.clientY - canvRect.top;

    highlightSide(x, y);
}

function highlightSide(x, y) {
    for (let row of squares) {
        for (let square of row) {
            square.highlight = null;
        }
    }

    let rows = squares.length;
    let cols = squares[0].length;
    currentCells = [];
    OUTER: for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (squares[i][j].contains(x, y)) {
                let side = squares[i][j].highlightSide(x, y);
                if (side != null) {
                    currentCells.push({ row: i, col: j });
                }

                let row = i,
                    col = j,
                    highlight,
                    neighbour = true;
                if (side == Side.LEFT && j > 0) {
                    col = j - 1;
                    highlight = Side.RIGHT;
                } else if (side == Side.RIGHT && j < cols - 1) {
                    col = j + 1;
                    highlight = Side.LEFT;
                } else if (side == Side.TOP && i > 0) {
                    row = i - 1;
                    highlight = Side.BOT;
                } else if (side == Side.BOT && i < rows - 1) {
                    row = i + 1;
                    highlight = Side.TOP;
                } else {
                    neighbour = false;
                }

                if (neighbour) {
                    squares[row][col].highlight = highlight;
                    currentCells.push({ row: row, col: col });
                }

                break OUTER;
            }
        }
    }
}

function fix_mouse() {
    canvRect = canv.getBoundingClientRect();
}

function Dot_And_Box_Game() {
    currentCells = [];
    player_Turn = Math.random() >= 0.5;
    score_AI = 0;
    score_HM = 0;
    timeEnd = 0;
    squares = [];
    loop_count = 1;
}

function selectSide() {
    if (currentCells == null || currentCells.length == 0) {
        return;
    }

    let filledSquare = false;
    for (let cell of currentCells) {
        if (squares[cell.row][cell.col].selectSide()) {
            filledSquare = true;
        }
    }
    currentCells = [];

    if (filledSquare) {
        if (score_HM + score_AI == GRID_SIZE * GRID_SIZE) {
            timeEnd = Math.ceil(DELAY_END + FPS);
        }
    } else {
        player_Turn = !player_Turn;
    }
}

function Square(x, y, w, h) {
    this.w = w;
    this.h = h;
    this.bot = y + h;
    this.left = x;
    this.right = x + w;
    this.top = y;
    this.highlight = null;
    this.numSelected = 0;
    this.owner = null;
    this.sideBot = { owner: null, selected: false };
    this.sideLeft = { owner: null, selected: false };
    this.sideRight = { owner: null, selected: false };
    this.sideTop = { owner: null, selected: false };

    this.contains = function (x, y) {
        return x >= this.left && x < this.right && y >= this.top && y < this.bot;
    };

    this.drawFill = function () {
        if (this.owner == null) {
            return;
        }

        ctx.fillStyle = getColor(this.owner, true);
        ctx.fillRect(
            this.left + STROKE,
            this.top + STROKE,
            this.w - STROKE * 2,
            this.h - STROKE * 2
        );

        drawText(
            getText(this.owner, true),
            this.left + this.w / 2,
            this.top + this.h / 2,
            getColor(this.owner, false),
            TEXT_SIZE_CELL
        );
    };

    this.drawSide = function (side, color) {
        switch (side) {
            case Side.BOT:
                drawLine(this.left, this.bot, this.right, this.bot, color);
                break;
            case Side.LEFT:
                drawLine(this.left, this.top, this.left, this.bot, color);
                break;
            case Side.RIGHT:
                drawLine(this.right, this.top, this.right, this.bot, color);
                break;
            case Side.TOP:
                drawLine(this.left, this.top, this.right, this.top, color);
                break;
        }
    };

    this.drawSides = function () {
        if (this.highlight != null) {
            this.drawSide(this.highlight, getColor(player_Turn, true));
        }

        if (this.sideBot.selected) {
            this.drawSide(Side.BOT, getColor(this.sideBot.owner, false));
        }
        if (this.sideLeft.selected) {
            this.drawSide(Side.LEFT, getColor(this.sideLeft.owner, false));
        }
        if (this.sideRight.selected) {
            this.drawSide(Side.RIGHT, getColor(this.sideRight.owner, false));
        }
        if (this.sideTop.selected) {
            this.drawSide(Side.TOP, getColor(this.sideTop.owner, false));
        }
    };

    this.getFreeSideCoords = function (side) {
        let coordsBot = { x: this.left + this.w / 2, y: this.bot - 1 };
        let coordsLeft = { x: this.left, y: this.top + this.h / 2 };
        let coordsRight = { x: this.right - 1, y: this.top + this.h / 2 };
        let coordsTop = { x: this.left + this.w / 2, y: this.top };

        let coords = null;
        switch (side) {
            case Side.BOT:
                coords = coordsBot;
                break;
            case Side.LEFT:
                coords = coordsLeft;
                break;
            case Side.RIGHT:
                coords = coordsRight;
                break;
            case Side.TOP:
                coords = coordsTop;
                break;
        }

        if (coords != null) {
            return coords;
        }

        let freeCoords = [];
        if (!this.sideBot.selected) {
            freeCoords.push(coordsBot);
        }
        if (!this.sideLeft.selected) {
            freeCoords.push(coordsLeft);
        }
        if (!this.sideRight.selected) {
            freeCoords.push(coordsRight);
        }
        if (!this.sideTop.selected) {
            freeCoords.push(coordsTop);
        }
        return freeCoords[Math.floor(Math.random() * freeCoords.length)];
    };

    this.highlightSide = function (x, y) {
        let dBot = this.bot - y;
        let dLeft = x - this.left;
        let dRight = this.right - x;
        let dTop = y - this.top;

        let dClosest = Math.min(dBot, dLeft, dRight, dTop);

        if (dClosest == dBot && !this.sideBot.selected) {
            this.highlight = Side.BOT;
        } else if (dClosest == dLeft && !this.sideLeft.selected) {
            this.highlight = Side.LEFT;
        } else if (dClosest == dRight && !this.sideRight.selected) {
            this.highlight = Side.RIGHT;
        } else if (dClosest == dTop && !this.sideTop.selected) {
            this.highlight = Side.TOP;
        }

        return this.highlight;
    };

    this.selectSide = function () {
        if (this.highlight == null) {
            return;
        }

        switch (this.highlight) {
            case Side.BOT:
                this.sideBot.owner = player_Turn;
                this.sideBot.selected = true;
                break;
            case Side.LEFT:
                this.sideLeft.owner = player_Turn;
                this.sideLeft.selected = true;
                break;
            case Side.RIGHT:
                this.sideRight.owner = player_Turn;
                this.sideRight.selected = true;
                break;
            case Side.TOP:
                this.sideTop.owner = player_Turn;
                this.sideTop.selected = true;
                break;
        }
        this.highlight = null;

        this.numSelected++;
        if (this.numSelected == 4) {
            this.owner = player_Turn;

            if (player_Turn) {
                score_HM++;
            } else {
                score_AI++;
            }

            return true;
        }
        return false;
    };
}