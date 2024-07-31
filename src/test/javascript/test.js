const CheckersGame = require('../../main/javascript/script.js');

describe('Checkers Game', () => {

    beforeEach(() => {
        CheckersGame.initialize(); // Reset the game before each test
    });

    // Test for getGameState function, after initialization all values should be initial
    test('Initial game state', () => {
        const gameState = CheckersGame.getGameState();
        expect(gameState.playerOnePieceCount).toBe(12);
        expect(gameState.playerTwoPieceCount).toBe(12);
        expect(gameState.isCurrentPlayer).toBe(1);
        expect(gameState.currentPlayer).toBe('player-one');
    });

    // Test for resetGame function: check if it correctly resets the game state
    test('Calling resetGame reset the game state to initial state', () => {
        let gameState = CheckersGame.getGameState();
        gameState.playerOnePieceCount = 0;
        gameState.playerTwoPieceCount = 5;

        // Call resetGame to reset the state
        CheckersGame.resetGame();

        // Check if the game state has been reset
        gameState = CheckersGame.getGameState();
        expect(gameState.playerOnePieceCount).toBe(12);
        expect(gameState.playerTwoPieceCount).toBe(12);
        expect(gameState.isCurrentPlayer).toBe(1);
        expect(gameState.currentPlayer).toBe('player-one');
    });

     // Test for getPosition function
     test('Get position from square', () => {
        // Creating a square
        const rowValue = 4; 
        const colValue = 3; 
        const square = document.createElement('div');
        square.setAttribute('data-row', rowValue.toString());
        square.setAttribute('data-col', colValue.toString());

        // Call the getPosition function
        const position = CheckersGame.getPosition(square);

        // Check if the returned position matches the expected values
        expect(position.row).toBe(rowValue);
        expect(position.col).toBe(colValue);
    });

    // Test for movePiece function: Check if it correctly moves pieces
    test('movePiece moves a selectedPiece to a new square', () => {
        // Simulate selecting a piece at (2, 3) for Player 1
        let fromSquare = CheckersGame.queryElement('[data-row="2"][data-col="3"]');
        let piece = fromSquare.querySelector('.piece');

        CheckersGame.selectPiece({ target: piece });

        let toSquare = CheckersGame.queryElement('[data-row="3"][data-col="4"]');
        CheckersGame.movePiece(toSquare);

        // Check if the piece moved to the new location
        expect(CheckersGame.getPieceAt({ row: 3, col: 4 })).not.toBeNull();
        expect(CheckersGame.getPieceAt({ row: 2, col: 3 })).toBeNull();

    });
    // Another test to check movePiece function
    test('movePiece moves a piece to a new square', () => {
        // Setting up initial conditions
        const fromSquare = CheckersGame.createSquare(2, 3);
        const toSquare = CheckersGame.createSquare(3, 4);
        const piece = CheckersGame.createPiece(2, 1);
        fromSquare.appendChild(piece);
    
        CheckersGame.movePiece(toSquare);
    
        // Expect the piece to be in the new square
        expect(toSquare.querySelector('.piece')).toBe(piece);
        expect(fromSquare.querySelector('.piece')).toBeNull();
    });

    // Test for getMoveDirections function
    test('getMoveDirections for regular and king pieces', () => {
        const regularPlayerOnePiece = document.createElement('div');
        regularPlayerOnePiece.classList.add('player-one');
    
        const kingPiece = document.createElement('div');
        kingPiece.classList.add('king');
    
        expect(CheckersGame.getMoveDirections(regularPlayerOnePiece)).toEqual([1]);
        expect(CheckersGame.getMoveDirections(kingPiece)).toEqual([1, -1]);
    });
    
    // Test for calculateMoveForDirection function
    test('calculateMoveForDirection with given piece and position', () => {
        const piecePosition = { row: 2, col: 3 };
        const direction = 1; 
        const opponentClass = 'player-two';
    
        const moves = CheckersGame.calculateMoveForDirection(piecePosition, direction, opponentClass);
    
        // Expect certain squares to be in the moves array
        expect(moves).toContainEqual({ row: 3, col: 2 });
        expect(moves).toContainEqual({ row: 3, col: 4 });
    });
    
    // Test for makeKing function
    test('makeKing transforms piece to a king', () => {
        const piece = document.createElement('div');
        piece.classList.add('player-one');
    
        CheckersGame.makeKing(piece);
    
        expect(piece.classList.contains('king')).toBe(true);
    });
    
    // Test for handleCaptures method
    test('handleCaptures removes the captured piece from the board', () => {
        let gameState = CheckersGame.getGameState();
    
        // Create two pieces and place them on the board
        const capturingPiece = CheckersGame.createPiece(2, 1);
        capturingPiece.classList.add('player-one');
        const capturedPiece = CheckersGame.createPiece(3, 2); 
        capturedPiece.classList.add('player-two');
    
        // Place the pieces on the board
        const fromSquare = CheckersGame.createSquare(2, 3);
        const toSquare = CheckersGame.createSquare(4, 5);
        const capturedSquare = CheckersGame.createSquare(3, 4);
    
        fromSquare.appendChild(capturingPiece);
        capturedSquare.appendChild(capturedPiece);
    
        gameState.playerOnePieceCount = 12;
        gameState.playerTwoPieceCount = 12;
    
        CheckersGame.handleCaptures(fromSquare, toSquare);
    
        // Captured piece should be removed and player2 should have 11 pieces
        expect(CheckersGame.getPieceAt({ row: 3, col: 4 })).toBeNull(); 
        expect(gameState.playerTwoPieceCount).toBe(11); 
    });
    
    
    

});
