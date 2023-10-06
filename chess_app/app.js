const gameBoard = document.querySelector("#gameboard")
const playerDisplay = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display")
const width = 8;
let playerGo = "black"
playerDisplay.textContent = "black"

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
]

function createBoard() {
    startPieces.forEach((startPiece, i)  => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.innerHTML = startPiece

        square.firstChild?.setAttribute("draggable", true)

        square.setAttribute('square-id', i)
        const row = Math.floor((63 - i) / 8) + 1

        if ( row % 2 === 0 ) {
            square.classList.add(i % 2 === 0 ? "beige" : "brown")
        } else{
            square.classList.add(i % 2 === 0 ? "brown" : "beige")
        } 

        if( i <= 15){
            square.firstChild.firstChild.classList.add("black")
        }

        if( i >= 48){
            square.firstChild.firstChild.classList.add("white")
        }

        gameBoard.append(square)
    })
}

createBoard()


const allSquares = document.querySelectorAll("#gameboard .square")

allSquares.forEach(square => {
    square.addEventListener("dragstart", dragStart)
    square.addEventListener("dragover", dragOver)
    square.addEventListener("drop", dragDrop)
})

let startPositionId
let draggedElement

function dragStart(e) {
 startPositionId = e.target.parentNode.getAttribute("square-id")
 draggedElement = e.target
}

function dragOver(e) {
    e.preventDefault()
}

function dragDrop(e) {
    e.stopPropagation()
    const correctGo = draggedElement.firstChild.classList.contains(playerGo)

    const taken = e.target.classList.contains("piece")
    const valid = checkIfValid(e.target)
    const opponentGo = playerGo === "white" ? "black" : "white"
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo)

    if (correctGo) {
        if(takenByOpponent && valid){
           e.target.parentNode.append(draggedElement)
           e.target.remove()
           changePlayer()
           return
        }

        if (taken && !takenByOpponent) {
            infoDisplay.textContent = "Illegal move!"
            setTimeout(() => infoDisplay.textContent = "", 2000)
            return
        }

        if(valid){
            e.target.append(draggedElement)
            changePlayer()
            return
        }
    }
    
}


function checkIfValid(target) {
    
    const targetId = Number(target.getAttribute("square-id"))|| Number(target.parentNode.getAttribute("square-id"))
    const startId = Number(startPositionId)
    const piece = draggedElement.id

    switch(piece) {
        case "pawn":
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15]
            const isStartInStarterRow = starterRow.includes(startId);
            const isTargetInFront = startId + width === targetId;
            const isTargetInFrontLeft = startId + width - 1 === targetId;
            const isTargetInFrontRight = startId + width + 1 === targetId;
    
            if (
                (isStartInStarterRow && startId + width * 2 === targetId) ||
                (isTargetInFront && !document.querySelector(`[square-id="${startId + width}"]`).firstChild) ||
                (isTargetInFrontLeft || isTargetInFrontRight && document.querySelector(`[square-id="${targetId}"]`).firstChild)
            ) {
                return true;
            }
            break;

        case "knight":        
            const horizontalDiff = Math.abs(startId % width - targetId % width);
            const verticalDiff = Math.abs(Math.floor(startId / width) - Math.floor(targetId / width));
            if ((horizontalDiff === 1 && verticalDiff === 2) || (horizontalDiff === 2 && verticalDiff === 1)) {
                 return true;
            }
            break;

            case "bishop":
                const isDiagonalBishop = Math.abs(targetId % width - startId % width) === Math.abs(Math.floor(targetId / width) - Math.floor(startId / width));
                const isPathClearBishop = isDiagonalBishop && isDiagonalPathClear(startId, targetId);
            
                if (isPathClearBishop) {
                    return true;
                }
                break; 

                case "rook":
                    const isVerticalRook = startId % width === targetId % width;
                    const isHorizontalRook = Math.floor(startId / width) === Math.floor(targetId / width);
                    const isPathClearRook = (isVerticalRook && isVerticalPathClear(startId, targetId)) || (isHorizontalRook && isHorizontalPathClear(startId, targetId));
                
                    if (isPathClearRook) {
                        return true;
                    }
                    break;

                case "queen":
                    const isVerticalQueen = startId % width === targetId % width;
                    const isHorizontalQueen = Math.floor(startId / width) === Math.floor(targetId / width);
                    const isDiagonalQueen = Math.abs(targetId - startId) % (width + 1) === 0 || Math.abs(targetId - startId) % (width - 1) === 0;
                    const isPathClearQueen = (isVerticalQueen && isVerticalPathClear(startId, targetId)) ||
                                       (isHorizontalQueen && isHorizontalPathClear(startId, targetId)) ||
                                       (isDiagonalQueen && isDiagonalPathClear(startId, targetId));
                    
                    if (isPathClearQueen) {
                        return true;
                        }
                    break;
                    
                case "king":
                        const kingMoves = [1, -1, width, -width, width + 1, width - 1, -width + 1, -width - 1];
                        if (kingMoves.includes(targetId - startId)) {
                            return true;
                        }
                        break;
                        
                    
    }

}

function isDiagonalPathClear(startId, targetId) {
    const rowDirection = targetId < startId ? -1 : 1;
    const colDirection = targetId % width < startId % width ? -1 : 1;
    let currentId = startId + width * rowDirection + colDirection;

    while (currentId !== targetId) {
        if (document.querySelector(`[square-id="${currentId}"]`).firstChild) {
            return false; // The path is blocked
        }
        currentId += width * rowDirection + colDirection;
    }

    return true; // The path is clear
}

function isVerticalPathClear(startId, targetId) {
    const rowDirection = targetId < startId ? -1 : 1;
    let currentId = startId + width * rowDirection;

    while (currentId !== targetId) {
        if (document.querySelector(`[square-id="${currentId}"]`).firstChild) {
            return false; // The path is blocked
        }
        currentId += width * rowDirection;
    }

    return true; // The path is clear
}

function isHorizontalPathClear(startId, targetId) {
    const colDirection = targetId % width < startId % width ? -1 : 1;
    let currentId = startId + colDirection;

    while (currentId !== targetId) {
        if (document.querySelector(`[square-id="${currentId}"]`).firstChild) {
            return false; // The path is blocked
        }
        currentId += colDirection;
    }

    return true; // The path is clear
}


function changePlayer() {
    if (playerGo === "black"){
        reverseIds()
        playerGo = "white"
        playerDisplay.textContent = "white"
    }else{
        revertIds()
        playerGo = "black"
        playerDisplay.textContent = "black"
    }
}

function reverseIds() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square,i) => square.setAttribute("square-id", (width*width -1) -i))
}

function revertIds() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square,i) => square.setAttribute("square-id", i)) 
}

function checkForWin(){
    const kings = Array.from(document.querySelectorAll("#king"))
}