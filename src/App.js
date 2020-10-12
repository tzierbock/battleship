import React from 'react';
import { useState, useMemo } from 'react';
import './App.css';

const horizontal = true

function App() {
  const [game, setGame] = useState({ phase: 'positionShips' })

  function resetGame() {
    setGame({ phase: 'positionShips' })
  }

  function startGame(ships) {
    setGame({ phase: 'play', ships: ships })
  }

  function gameOver() {
    setGame({ phase: 'over' })
  }

  switch (game.phase) {
    case 'positionShips':
      return <div className="App">
        <PositionSelector onStartGame={startGame} />
      </div>
    case 'play':
      return <Player ships={game.ships} gameOver={gameOver} />
    case 'over':
      return <div>
        <h2>Game Over</h2>
        <p>Congratulations you have won</p>
        <button onClick={resetGame}>Start Over</button>
      </div>
    default:
      return 'Error'
  }
}

function canStart(ships) {
  for (let ship of ships) {
    if (ship.position === undefined) {
      return false
    }
  }
  return true
}

function newBoard(old) {
  const board = []
  for (let i = 0; i < 10; i++) {
    let cells = []
    for (let j = 0; j < 10; j++) {
      if (old && old[i][j].state === 'occupied') {
        cells.push({ state: 'occupied' })
      } else if (old && old[i][j].state === 'hit') {
        cells.push({ state: 'hit' })
      } else if (old && old[i][j].state === 'miss') {
        cells.push({ state: 'miss' })
      } else {
        cells.push({ state: 'empty' })
      }
    }
    board.push(cells)
  }

  return board
}

function newShipList() {
  return [
    { name: 'Fregatte (2)', length: 2 },
    { name: 'Zerstörer (3)', length: 3 },
    { name: 'Zerstörer (3)', length: 3 },
    { name: 'Kreuzer (4)', length: 4 },
    { name: 'Flugzeugträger (5)', length: 5 },
  ]
}

function PositionSelector({ onStartGame }) {
  const [ships, setShips] = useState(newShipList())
  const [board, setBoard] = useState(newBoard())
  const [selectedShip, setSelectedShip] = useState(null)

  const [direction, setDirection] = useState(horizontal)

  function selectShip(ship) {
    setSelectedShip(ship)
  }

  function updateBoard(i, j) {
    const updatedBoard = newBoard(board)
    if (selectedShip) {
      if (direction === horizontal) {
        if (j + selectedShip.length - 1 >= 10) {
          return
        }
        for (let idx = j; idx < j + selectedShip.length && idx < 10; idx++) {
          if (updatedBoard[i][idx].state === 'occupied') {
            return
          }
          updatedBoard[i][idx].state = 'candidate'
        }
      } else {
        if (i + selectedShip.length - 1 >= 10) {
          return
        }
        for (let idx = i; idx < i + selectedShip.length && idx < 10; idx++) {
          if (updatedBoard[idx][j].state === 'occupied') {
            return
          }
          updatedBoard[idx][j].state = 'candidate'
        }
      }
    }

    setBoard(updatedBoard)
  }

  function placeShip(i, j) {
    const updatedBoard = newBoard(board)
    if (selectedShip) {
      selectedShip.position = { row: i, col: j, rot: direction }

      if (direction === horizontal) {
        if (j + selectedShip.length - 1 >= 10) {
          return
        }
        for (let idx = j; idx < j + selectedShip.length && idx < 10; idx++) {
          if (updatedBoard[i][idx].state === 'occupied') {
            return
          }
          updatedBoard[i][idx].state = 'occupied'
        }
      } else {
        if (i + selectedShip.length - 1 >= 10) {
          return
        }
        for (let idx = i; idx < i + selectedShip.length && idx < 10; idx++) {
          if (updatedBoard[idx][j].state === 'occupied') {
            return
          }
          updatedBoard[idx][j].state = 'occupied'
        }
      }
      setSelectedShip(null)
    }

    setBoard(updatedBoard)
  }

  function reset() {
    setBoard(newBoard())
    setShips(newShipList())
  }

  function next() {
    onStartGame(ships)
  }

  return <div>
    <h3>Wähle aus wo deine Schiffe sein sollen</h3>
    <GameBoard board={board} onFireMissile={placeShip} onPositionUpdate={updateBoard} />
    <ShipInventory ships={ships} selectedShip={selectedShip} onSelectShip={selectShip} />
    <button onClick={() => setDirection(!direction)}>Flip</button>
    <button onClick={() => reset()}>Reset</button>
    <button disabled={!canStart(ships)} onClick={() => next()}>Start Game</button>
  </div>
}

function GameBoard({ board, onFireMissile, onPositionUpdate }) {
  let rows = []
  let cells = []
  cells.push(<td key={0}></td>)
  for (let j = 0; j < 10; j++) {
    cells.push(<td key={j + 1}>{j + 1}</td>)
  }
  rows.push(<tr key={0}>{cells}</tr>)

  for (let i = 0; i < 10; i++) {
    let cells = []
    cells.push(<td key={0}>{(i + 10).toString(36).toUpperCase()}</td>)
    for (let j = 0; j < 10; j++) {
      let style = {}
      switch (board[i][j].state) {
        case 'occupied':
          style = { backgroundColor: 'darkred' }
          break
        case 'candidate':
          style = { backgroundColor: 'salmon' }
          break;
        case 'hit':
          style = { backgroundColor: 'darkred' }
          break;
        case 'miss':
          style = { backgroundColor: 'aqua' }
          break;
        default:
          style = {}
      }
      cells.push(<td key={j + 1}
        style={style}
        className="boardSector"
        onMouseEnter={() => onPositionUpdate ? onPositionUpdate(i, j) : null}
        onClick={() => onFireMissile ? onFireMissile(i, j) : null}></td>)
    }

    rows.push(<tr key={i + 1}>{cells}</tr>)
  }

  return <table className="gameBoard">
    <tbody>
      {rows}
    </tbody>
  </table>
}

function ShipInventory({ ships, selectedShip, onSelectShip }) {
  let items = ships.map((s, i) => {
    const style = selectedShip === s ? { color: 'blue' } : null

    if (s.position) {
      return <li style={{ color: 'red' }} key={i}>{s.name}</li>
    }

    return <li style={style} onClick={() => onSelectShip(s)} key={i}>{s.name}</li>
  })

  return <ul>
    {items}
  </ul>
}

function calculateBoard(ships) {
  const board = newBoard()
  for (let ship of ships) {
    ship.hits = 0
    const pos = ship.position
    if (pos.rot === horizontal) {
      for (let i = pos.col; i < pos.col + ship.length; i++) {
        board[pos.row][i].state = 'occupied'
        board[pos.row][i].ship = ship
      }
    } else {
      for (let i = pos.row; i < pos.row + ship.length; i++) {

        board[i][pos.col].state = 'occupied'
        board[i][pos.col].ship = ship
      }
    }
  }
  return board
}

function isGameOver(ships) {
  for (let ship of ships) {
    if (ship.length !== ship.hits) {
      return false
    }
  }
  return true
}

function Player({ ships, gameOver }) {
  const targetBoard = useMemo(() => calculateBoard(ships), [ships])
  const [playerBoard, setPlayerBoard] = useState(newBoard())

  function fire(i, j) {
    if (playerBoard[i][j].state !== 'empty') {
      return
    }

    const board = newBoard(playerBoard)
    if (targetBoard[i][j].state === 'occupied') {
      board[i][j].state = 'hit'
      targetBoard[i][j].ship.hits++
    } else {
      board[i][j].state = 'miss'
    }

    if (isGameOver(ships)) {
      gameOver()
    }
    setPlayerBoard(board)
  }

  const sunkenShips = ships.slice().filter(s => s.length === s.hits)

  return <div>
    <GameBoard onFireMissile={fire} board={playerBoard} />
    <GameBoard board={targetBoard} />
    <ScoreBoard ships={sunkenShips} />
  </div>
}

function ScoreBoard({ ships }) {
  const items = ships.map(s => <li>{s.name}</li>)
  return <div>
    <h4>Gesunkene Schiffe</h4>
    <ul>{items}</ul>
  </div>
}

export default App;
