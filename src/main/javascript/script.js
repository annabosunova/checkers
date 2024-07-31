const CheckersGame = (function () {
    /**
     * GameState is an object that holds state of the game data
     */
    let GameState = {
        playerOnePieceCount: 12,
        playerTwoPieceCount: 12,
        isCurrentPlayer: 1,
        currentPlayer: 'player-one',
        pieces: {}
    };
    /**
     * queryElement: Selector -> Element or Null
     * Processes and returns single element
     */
    function queryElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`Element not found: ${selector}`);
            return null;
        }
        return element;
    }

    /**
     * queryElements: Selector -> Elements or Null
     * Processes and returns multiple elements
     */
    function queryElements(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.error(`Elements not found: ${selector}`);
            return [];
        }
        return elements;
    }
    /**
     * resetGame: -> Void
     * Resets the game, creates a new checkboard
     */
    function resetGame() {
        const initialState = getInitialGameState();
        applyGameState(initialState);
        createBoard();
    }
    /**
     * getInitialGameState: -> Object (GameState)
     * Returns initial state of the game.
     *  
     */
    function getInitialGameState() {
        return {
            playerOnePieceCount: 12,
            playerTwoPieceCount: 12,
            isCurrentPlayer: 1,
            currentPlayer: 'player-one'
            
        };
    }
    /**
     * applyGameState: GameState (gameState) -> Void
     * Updates the GameState object based on the provided gameState object.
     */
    function applyGameState(gameState) {
        GameState = {...GameState, ...gameState};
    }

    /**
     * clearBoard: -> Void
     * Clear the board by setting the innerHTML property 
     * of this element to an empty string.
     * 
     * Example: 
     * 
     * function createBoard(){
     *     clearBoard();
     *     ...
     * }
     * Can be used in createBoard function,
     * to clear the board before creating a new one.
     */
    function clearBoard() {
        const board = queryElement('#checkersBoard');
        if (board) {
            board.innerHTML = '';
        }
    }

    /**
     * addBoardListener: -> Void
     * Attaches a click event listener to the checkerboard.
     * 
     * This function adds a single event listener to the checkerboard. When a click occurs,
     * it determines whether the click was on a piece or a square and calls the appropriate
     * function (selectPiece or movePiece).
     */
    function addBoardListener() {
        const board = queryElement('#checkersBoard');
        if (!board) return;

        board.addEventListener('click', function (event) {
            const clickedElement = event.target;

            // Handle piece selection
            if (clickedElement.classList.contains('piece') && clickedElement.classList.contains(GameState.currentPlayer)) {
                selectPiece(event);
            } else if (clickedElement.classList.contains('square') && clickedElement.classList.contains('black')) {
                // Only look for a selected piece when handling a move to a square
                const selectedPiece = queryElement('.selected');
                if (selectedPiece) {
                    movePiece(clickedElement);
                }
            }
        });
    }

    /**
     * selectPiece: MouseEvent -> Void
     * Handles the selection of a checker piece.
     * 
     * This function is triggered when a checker piece is clicked. It first ensures that any
     * previously selected piece is deselected by removing the 'selected' class. It then adds
     * the 'selected' class to the clicked piece, visually indicating that it is selected.
     * 
     * 
     */
    function selectPiece(event) {
        // This stops the click event from being handled by parent elements
        event.stopPropagation();
        // Deselect any previously selected piece
        const previouslySelected = queryElement('.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
            unhighlightSquares();
        }

        // Select the new piece
        const piece = event.target;
        piece.classList.add('selected');

        // Calculate and highlight valid moves for the selected piece
        const validMoves = calculateValidMoves(piece);
        validMoves.forEach(move => highlightSquare(move));
    }

    /**
     * getMoveDirections: HTMLElement (piece) -> Array
     * Determines the possible directions a piece can move based on its type and status.
     * 
     * Regular pieces move in one direction (forward),
     * while king pieces can move both forward and backward.
     * 
     * The function returns an array of numbers representing the row direction
     * (1 for down, -1 for up).
     * 
     */
    function getMoveDirections(piece) {
        const isPlayerOne = piece.classList.contains('player-one');
        const isKing = piece.classList.contains('king');

        let directions = isPlayerOne ? [1] : [-1]; // Default direction based on player
        if (isKing) {
            directions = [1, -1]; // Kings can move both ways
        }

        return directions;
    }

    /**
     * calculateMoveForDirection: Object(piecePosition) Number(direction) String (opponentClass) -> Array
     * 
     * Calculates the valid moves for a piece in a given direction.
     * 
     * This function checks both regular and capturing moves for a piece in the specified direction.
     * It returns an array of move objects, each representing a valid move position.
     * 
     */
    function calculateMoveForDirection(piecePosition, direction, opponentClass) {
        const validMoves = [];

        // Check for regular and capturing moves in each direction
        [-1, 1].forEach(colDirection => {
            const adjacentSquare = { row: piecePosition.row + direction, col: piecePosition.col + colDirection };
            const jumpSquare = { row: piecePosition.row + 2 * direction, col: piecePosition.col + 2 * colDirection };

            if (isValidSquare(adjacentSquare)) {
                if (isSquareEmpty(adjacentSquare)) {
                    // Regular move
                    validMoves.push(adjacentSquare);
                } else if (isValidSquare(jumpSquare) && isSquareEmpty(jumpSquare)) {
                    // Check if the adjacent square contains an opponent's piece
                    const adjacentPiece = getPieceAt(adjacentSquare);
                    if (adjacentPiece && adjacentPiece.classList.contains(opponentClass)) {
                        // Capture move
                        validMoves.push({ ...jumpSquare, isCapture: true });
                    }
                }
            }
        });

        return validMoves;
    }

    /**
     * calculateValideMoves: HTMLElement (piece) -> Array
     * 
     * Find all valid moves for the given piece based on its current position,
     * player type, and king status. The function determines the possible moves in the forward 
     * direction for regular pieces and both forward and backward directions for king pieces.
     * 
     * It returns an array of objects, each representing a valid move position.
     */
    function calculateValidMoves(piece) {
        const validMoves = [];
        const position = getPosition(piece.parentElement);
        //const opponentClass = piece.classList.contains('player-one') ? 'player-two' : 'player-one';

        const opponentClass = GameState.currentPlayer === 'player-one' ? 'player-two' : 'player-one';

        const directions = getMoveDirections(piece);

        directions.forEach(direction => {
            validMoves.push(...calculateMoveForDirection(position, direction, opponentClass));
        });

        return validMoves;
    }

    /**
     * canPlayerPlay: String (player) -> Boolean
     * This function determines whether a player has any moves left and prevents the 
     * game from ending up in an infinite state when a player is out of moves and no 
     * winner was declared.
     */
    function canPlayerPlay(player) {
        const playerPieces = queryElements(`.piece.${player}`);

        for (const piece of playerPieces) {
            if (calculateValidMoves(piece).length > 0) {
                return true; // The player has at least one valid move
            }
        }

        return false; // The player cannot make any valid moves
    }

    /**
    * highlightSquare: { row: number, col: number }(position) -> Void
    * Highlights the square at the specified position with a green color.
    */
    function highlightSquare(position) {
        const square = queryElement(`.square[data-row="${position.row}"][data-col="${position.col}"]`);
        if (square) {
            square.classList.add('highlighted');
        }
    }
    /**
     * highlightValidCaptureMoves: HTMLElement (piece) -> Void
     * Checks whether the move considered as capture event,
     * If so calls highlightSquare function
     * to hightlight such a square.
     * 
     */
    function highlightValidCaptureMoves(piece) {
        const validMoves = calculateValidMoves(piece);
        validMoves.forEach(move => {
            if (move.isCapture) highlightSquare(move);
        });
    }
    /**
     * unhighlightSquares: -> Void
     * Removes the highlight from all squares.
     */
    function unhighlightSquares() {
        const highlightedSquares = queryElements('.square.highlighted');
        highlightedSquares.forEach(square => {
            square.classList.remove('highlighted');
        });
    }

    /**
     * addPiece: HTMLElement (piece) HTMLElement (toSquare) -> Void
     * 
     * Adds checker piece to a new square on the board.
     * It physically moves the piece's element in the DOM.
     */
    function addPiece(piece, toSquare) {
        toSquare.appendChild(piece);
    }

    /**
     * processCapture: HTMLElement (fromSquare) HTMLElement (toSquare) Object (move) HTMLElement (selectedPiece:) -> Void
     * Processes the capturing of an opponent's piece, if possible.
     * 
     * This function handles the logic of capturing an opponent's piece during a move.
     * It calls the handleCaptures function if the move is a capture and then checks for
     * any additional captures by calling checkAndContinueCapture.
     */
    function processCapture(fromSquare, toSquare, move, selectedPiece) {
        if (move.isCapture) {
            handleCaptures(fromSquare, toSquare);
            checkAndContinueCapture(selectedPiece);
        }
    }
    /**
     * checkAndContinueCapture: HTMLElement (selectedPiece) -> Void
     * Checks for and handles additional captures if available
     * 
     * After a capturing move, this function determines whether the same piece can continue capturing
     * more opponent pieces. If so, it allows the player to continue their turn; otherwise,
     * it updates the game state to the next player's turn.
     * 
     */
    function checkAndContinueCapture(selectedPiece) {
        if (canContinueCapture(selectedPiece)) {
            selectedPiece.classList.add('selected');
            highlightValidCaptureMoves(selectedPiece);
        } else {
            updateGameState();
        }
    }
    /**
     * handleKingTransformation: HTMLElement (selectedPiece) HTMLElement (toSquare) -> Void
     * Transforms a regular piece into a king, if possible.
     * 
     */
    function handleKingTransformation(selectedPiece, toSquare) {
        if (becameKing(selectedPiece, toSquare)) {
            makeKing(selectedPiece);
        }
    }


    /**
     * movePiece: HTMLElement (toSquare) -> Void
     *  Handles the logic for moving a selected checker piece to a new square.
     * 
     * This function is intended to be called when a valid move position is clicked. It moves
     * the currently selected piece (if any) to the specified square (toSquare). After moving
     * the piece, it removes the 'selected' class from the piece.
     * 
     */
    function movePiece(toSquare) {
        const selectedPiece = queryElement('.selected');
        if (!selectedPiece) return;

        const fromSquare = selectedPiece.parentElement;
        const validMoves = calculateValidMoves(selectedPiece);
        const toPosition = getPosition(toSquare);

        const move = validMoves.find(pos => pos.row === toPosition.row && pos.col === toPosition.col);

        if (move) {
            addPiece(selectedPiece, toSquare);
            processCapture(fromSquare, toSquare, move, selectedPiece);
            handleKingTransformation(selectedPiece, toSquare);

            selectedPiece.classList.remove('selected');
            unhighlightSquares();

            if (!move.isCapture) {
                updateGameState();
            }
        }
    }

    /**
     * canContinueCapture: HTMLElement (piece) -> Boolean
     * Determines whether the piece have an ability to continue
     * capturing opponents pieces.
     * Returns true if so, false otherwise.
     * 
     */
    function canContinueCapture(piece) {
        return calculateValidMoves(piece).some(move => move.isCapture);
    }


    /**
     * handleCaptures: HTMLElement (fromSquare) HTMLElement (toSquare) -> Void
     * Handles the captures after a piece is moved.
     * 
     * This function takes the destination square as an argument and checks for captures.
     * If a capture is possible, it removes the captured piece from the board.
     */
    function handleCaptures(fromSquare, toSquare) {
        // Calculate the position of the captured piece
        const fromPosition = getPosition(fromSquare);
        const toPosition = getPosition(toSquare);
        const capturedPosition = {
            row: (fromPosition.row + toPosition.row) / 2,
            col: (fromPosition.col + toPosition.col) / 2
        };

        // Find the captured piece
        const capturedPiece = getPieceAt(capturedPosition);

        // Remove the captured piece from the board and update the counts
        if (capturedPiece) {
            capturedPiece.remove(); // This line actually removes the piece from the board
            if (capturedPiece.classList.contains('player-one')) {
                GameState.playerOnePieceCount--;
            } else {
                GameState.playerTwoPieceCount--;
            }
        }

    }


    /**
     * updateGameState: -> Void
     * Updates the game state after each move.
     * 
     * This function checks for a winner or any other conditions that may change the game state.
     */
    function updateGameState() {
        // Check if either player has no pieces left
        if (GameState.playerOnePieceCount === 0 || !canPlayerPlay('player-one')) {
            alert('Player Two wins!');
            resetGame();

        } else if (GameState.playerTwoPieceCount === 0 || !canPlayerPlay('player-two')) {
            alert('Player One wins!');
            resetGame();

        } else {
            changePlayerTurn();
        }

    }

    /**
     * changePlayerTurn: -> Void
     * Updates the current player after each turn 
     * 
     * This function updates the current player (this indicates who can play at the moment)
     */
    function changePlayerTurn() {
        // Update player turn indicator
        const playerIndex = queryElement('#currentPlayerIndex');
        const board = queryElement('#checkersBoard');
        board.classList.remove('player-one-turn', 'player-two-turn');

        if (GameState.isCurrentPlayer == 1) {
            GameState.isCurrentPlayer = 2;
            GameState.currentPlayer = 'player-two';
            playerIndex.innerText = "Player Two's Turn";
            board.classList.add('player-two-turn');
        } else if (GameState.isCurrentPlayer == 2) {
            GameState.isCurrentPlayer = 1;
            GameState.currentPlayer = 'player-one';
            playerIndex.innerText = "Player One's Turn";
            board.classList.add('player-one-turn');
        }

    }
    /**
     * getPosition: HTMLElement (square) -> Position
     * Gets the position of a square on the board 
     * 
     * This function extracts the 'data-row' and 'data-col' attributes from the square's HTML element.
     */
    function getPosition(square) {
        const row = parseInt(square.getAttribute('data-row'));
        const col = parseInt(square.getAttribute('data-col'));
        return { row, col };
    }

    /**
     * makeKing: HTMLElement (piece) -> Void
     * Makes a regular checker piece the king.
     * 
     */
    function makeKing(piece) {
        piece.classList.add('king');
        // Determine the player type
        const isPlayerOne = piece.classList.contains('player-one');

        // Change the image based on the player type
        const kingImage = isPlayerOne ? '/images/white-king.jpeg' : '/images/black-king.jpeg';
        piece.innerHTML = `<img src="${kingImage}" alt="King Piece">`;
    }


    /**
     * getPieceAt: Position -> HTMLElement (piece) or null
     * Retrieves the checker piece at a specified position on the board.
     * 
     * This function locates the square at the given row and column position and then returns 
     * the checker piece within that square, if any. If there is no piece at the specified 
     * position, the function returns null.
     * 
     */
    function getPieceAt(position) {
        const square = queryElement(`.square[data-row="${position.row}"][data-col="${position.col}"]`);
        return square ? square.querySelector('.piece') : null;
    }

    /**
     * isValidSquare: Position -> Boolean
     * Checks if the position is a valid square on the checkboard
     * Returns true or false
     */
    function isValidSquare(position) {
        return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
    }

    /**
     * isSquareEmpty: Position -> Boolean
     * Checks if the square at given position is empty (unoccupied)
     * Returns true of false 
     * 
     */
    function isSquareEmpty(position) {
        const square = queryElement(`.square[data-row="${position.row}"][data-col="${position.col}"]`);
        return square && !square.hasChildNodes();
    }

    /**
     * becameKing: HTMLElement (piece), HTMLElement (toSquare) -> Boolean
     * Checks whether the piece of any players became a king.
     */
    function becameKing(piece, toSquare) {
        const toPosition = getPosition(toSquare);
        const isPlayerOne = piece.classList.contains('player-one');
        return (isPlayerOne && toPosition.row === 7) || (!isPlayerOne && toPosition.row === 0);
    }
    /**
     * createSquare: (row: number, col: number) -> HTMLElement
     * Creates and returns a single square of the checkerboard.
     * 
     * Given row and column indices, this function creates a square element.
     * The square's color is determined based on its position to achieve the checkerboard pattern.
     * The square is also assigned data attributes to represent its position on the board.
     * 
     */
    function createSquare(row, col) {
        let square = document.createElement('div');
        square.classList.add('square');
        square.setAttribute('data-row', row);
        square.setAttribute('data-col', col);

        // Determine if the square is black or white
        square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');

        return square;
    }
    /**
     * createPiece: (row: number, pieceId: number) -> HTMLElement
     * Creates and returns a checker piece element.
     * 
     * Given a row number and a unique piece identifier, this function creates a new checker piece.
     * The piece is assigned a class based on its row, determining if it belongs to player one or player two.
     * Each piece is given a unique ID.
     * 
     */
    function createPiece(row, pieceId) {
        let piece = document.createElement('div');
        piece.classList.add('piece');
        piece.classList.add(row < 3 ? 'player-one' : 'player-two');
        piece.id = 'Piece-' + pieceId;
        return piece;
    }

    /**
     * populateBoard: HTMLElement (board) -> Void
     * Populates the checkerboard with squares and pieces.
     * 
     * This function creates and arranges the squares and checker pieces on the board.
     * It uses a nested loop to create squares for each position on an 8x8 grid.
     * Checker pieces are added to the appropriate squares based on their initial positions in the game.
     * 
     */
    function populateBoard(board) {
        let pieceId = 1;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let square = createSquare(row, col);
                if ((row + col) % 2 !== 0 && (row < 3 || row > 4)) {
                    let piece = createPiece(row, pieceId++);
                    addPiece(piece, square);
                    GameState.pieces[piece.id] = piece; // Storing the piece in the hash table
                }
                addPiece(square, board);

            }
        }
    }

    /**
     * createBoard: -> Void
     * Initializes and displays the checkerboard with all necessary pieces.
     * 
     * This function is responsible for setting up the initial state of the checkerboard.
     * It clears any existing board, creates an 8x8 grid of squares, and places checker pieces
     * in their initial positions for both players. It also sets up the necessary event listeners
     * for gameplay interaction.
     * 
     * The board is populated by calling the populateBoard function and the event listeners
     * are attached using addBoardListener. After setting up the board, the player turn is also updated.
     */
    function createBoard() {
        clearBoard();
        const board = queryElement('#checkersBoard');
        if (!board) return;

        populateBoard(board);
        addBoardListener();
        changePlayerTurn();
    }

    // Public API of the module
    // Return functions that can be used in tests
    return {
        initialize: createBoard,
        getGameState: () => GameState,
        updateGameState: updateGameState,
        resetGame: resetGame,
        handleCaptures:handleCaptures,
        createPiece:createPiece,
        createSquare:createSquare,
        movePiece:movePiece,
        getPieceAt:getPieceAt,
        selectPiece:selectPiece,
        queryElement:queryElement,
        getPosition:getPosition,
        getMoveDirections:getMoveDirections,
        calculateMoveForDirection:calculateMoveForDirection,
        makeKing:makeKing
        
    };
})();

// Initialize the game
CheckersGame.initialize();

module.exports = CheckersGame;
