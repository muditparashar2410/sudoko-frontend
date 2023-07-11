import React, { useState } from 'react';
import './Sudoko_Grid.css';
// import './SudoControl.js';
import axios from 'axios';

const Sudoku_Grid = () => {
  const [board, setBoard] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState();
  const [selectedCell, setSelectedCell] = useState(null);
  const [originalValues, setOriginalValues] = useState([]);
 
  const checkGameStatus = () => {
    let isBoardFilled = true;

    for (let row of board) {
      for (let cell of row) {
        if (cell === '') {
          isBoardFilled = false;
          break;
        }
      }
      if (!isBoardFilled) {
        break;
      }
    }

    if (isBoardFilled) {
      alert('Congratulations! You have won the game!');
      handleStartClick(); 
    }
  };
  // const generateBoard = () => {
  //   const newBoard = Array(9).fill().map(() => Array(9).fill(''));
  //   setBoard(newBoard);
  // };
  const handleStartClick = () => {
    axios
    .post('https://sudokobackend.azurewebsites.net/api/sudoku/start', 'START', {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    .then(response => {
      // console.log('Sudoku puzzle started:', response.data);
        // Handle the response or update the state as needed

        // After the first request is successful, make the second GET request
        axios
          .get('https://sudokobackend.azurewebsites.net/api/sudoku/generate')
          .then(response => {
            // console.log(response.data);
            // const newBoard = Array(9).fill().map(() => Array(9).fill(''));
            // Update the board state with the generated puzzle
            // const responseData = JSON.parse(response.data);
            //             const transformedData = response.data.puzzle.map((row) => row.map((cell) => cell.value));
            // setBoard(transformedData);
            // setBoard(newBoard);
            const puzzleData = response.data;
            setBoard(response.data.map(row => row.map(cell => cell === 0 ? '' : cell)));;
            const newOriginalValues = puzzleData.map(row => row.map(cell => (cell === 0 ? '' : cell)));
            setOriginalValues(newOriginalValues);
          })
          .catch(error => {
            console.error('Failed to generate Sudoku puzzle:', error);
            // Handle the error as needed
          });
      })
      .catch(error => {
        console.error('Failed to start Sudoku puzzle:', error);
        // Handle the error as needed
      });
    };
    const handleCellValueChange = (rowIndex, colIndex, value) => {
      if (selectedNumber === '') {
        setSelectedCell(null);
        return;
      }
    
      if (selectedCell !== null && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
        return;
      }
      const originalCellValue = originalValues[rowIndex][colIndex];
    
      if (originalCellValue !== '') {
        return;
      }
    
      const newBoard = [...board];
      newBoard[rowIndex][colIndex] = selectedNumber;
      setBoard(newBoard);
      setSelectedCell({ row: rowIndex, col: colIndex });
      
    
      const requestData = {
        row: rowIndex,
        column: colIndex,
        value: selectedNumber
      };
      if (value !== '') {
      axios.post('https://sudokobackend.azurewebsites.net/api/sudoku/fill', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log('Cell filled:', response.data);
          // Handle the response if needed
          setSelectedCell(null);
          checkGameStatus();
        })
        .catch(error => {
          console.error('Failed to fill cell:');
          newBoard[rowIndex][colIndex] = '';
      setBoard(newBoard);
      setSelectedCell(null);
      checkGameStatus();
        });
      } else {
        axios
        .post('https://sudokobackend.azurewebsites.net/api/sudoku/clear', requestData, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          console.log('Cell cleared:', response.data);
          // Handle the response if needed
          setSelectedCell(null);
          checkGameStatus();
        })
        .catch(error => {
          console.error('Failed to clear cell:', error);
          // Reset the cell value to blank
          newBoard[rowIndex][colIndex] = '';
          setBoard(newBoard);
          setSelectedCell(null);
          // Alert the user about the error
          alert('Failed to clear the cell. Please try again.');
        });
    }
    };
    
  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
  };
  const handleHintClick = () => {
    axios.get('https://sudokobackend.azurewebsites.net/api/sudoku/hint')
      .then(response => {
        const hint = response.data;
        if (hint) {
          const { row, column, value } = hint;
          alert(`Hint generated: Fill cell at row ${row}, column ${column} with ${value}`);
        } else {
          alert('No hint available.');
        }
      })
      .catch(error => {
        console.error('Failed to generate hint:', error);
        // Handle the error as needed
      });
  };
  return (
    <div className="sudoku-container">
    <div className="board-container">
      <table className="board">
        <tbody>
          {board.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className={`cell ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'selected-cell' : ''} ${originalValues[rowIndex][colIndex] !== '' && board[rowIndex][colIndex] === originalValues[rowIndex][colIndex] ? 'original-cell' : ''}`}
                  onClick={() => handleCellValueChange(rowIndex, colIndex)}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="number-selector">
      <h3>Number Selector</h3>
      <div className="number-buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button
            key={number}
            className={`number-button ${selectedNumber === number ? 'selected' : ''}`}
            onClick={() => handleNumberSelect(number)}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
    <button className="generate-button" onClick={handleStartClick}>
      Start/ResetGame
    </button>
    <button className="hint-button" 
    onClick={handleHintClick}
    >
  Hint
</button>
  </div>
  );
};

export default Sudoku_Grid;
