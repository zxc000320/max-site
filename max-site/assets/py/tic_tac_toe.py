from js import document
from pyodide import create_proxy

Tic_Tac_Toe_table = document.getElementById('Tic_Tac_Toe_table')

player1 = hm = 'O'
player2 = ai = 'X'

turn = player1

board = ['_'] * 9

win_list = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
vs_ai = document.getElementById("ai")
vs_hm = document.getElementById("hm")

def check_win(b):
    winner = ''
    for (x, y, z) in win_list:
        if b[x] != '_':
            if b[x] == b[y] == b[z]:
                winner = b[x]
                break
                
    if winner:
        return True, winner
    
    if '_' in b:
        return False, ''
    
    return True, 'Tie'

def mark_and_changr_turn(i):
    global turn
    cell = document.getElementById(f'{i}')
    cell.innerHTML = turn
    board[i] = turn
    
    turn = player2 if turn == player1 else player1
    
scores = {
    ai : 1,
    hm : -1,
    'Tie' : 0
};

def minimax(b, ai_turn):
    result, winner = check_win(b)
    
    if result:
        return scores[winner]
    
    if ai_turn:
        bestScore = float('-inf')
        for i, c in enumerate(b):
            if c == '_':
                b[i] = ai
                score = minimax(b, False)
                b[i] = '_'
                bestScore = max(score, bestScore)
    else:
        bestScore = float('inf')
        for i, c in enumerate(b):
            if c == '_':
                b[i] = hm
                score = minimax(b, True)
                b[i] = '_'
                bestScore = min(score, bestScore)
    return bestScore
    
def best_move():
    bestScore = float('-inf')
    for i, c in enumerate(board):
        if c == '_':
            board[i] = ai
            score = minimax(board, False)
            board[i] = '_'
            if bestScore < score:
                bestScore = score
                spot = i
    return spot
    
def ai_turn():
    spot = best_move()
    mark_and_changr_turn(spot)
    
    
def click_cell(e):
    cell_id = int(e.target.id)
    
    if board[cell_id] == '_' and not winner:
        mark_and_changr_turn(cell_id)
        if vs_ai.checked and turn == ai and not check_win(board)[0]:
            ai_turn()
        
    print_turn_massage()

def restart_game(e):
    
    for i in range(9):
        cell = document.getElementById(f'{i}')
        cell.innerHTML = ''
        board[i] = '_'
        
    if turn == player2 and vs_ai.checked:
        ai_turn()
        
    print_turn_massage()
        
def init_game():
    for i in range(3):
        tr = document.createElement('tr')
        for j in range(3):
            td = document.createElement('td')
            td.id = f'{i * 3 + j}'
            td.className = 'Tic_Tac_Toe_td'
            td.addEventListener('click', create_proxy(click_cell))
            tr.appendChild(td)
        Tic_Tac_Toe_table.appendChild(tr)
        
    print_turn_massage()

winner = ''
print_turn = document.getElementById("print_turn")
def print_turn_massage():
    global winner
    _, winner = check_win(board)
    
    if winner:
        if winner != 'Tie':
            print_turn.innerHTML = f"{winner} 승리!!"
        else :
            print_turn.innerHTML = "무승부!!"
    else:
        print_turn.innerHTML = f"{turn}의 차례!"
        
init_game()