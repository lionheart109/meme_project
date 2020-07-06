'use strict'

let gLineDefaults;

let gCanvasHeight;
let gCanvasWidth;
let gMeme = {};


function createLineDefaults() {
    gLineDefaults = {
        txt: '',
        placeholder: 'Write your text here',
        font: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
        fontSize: window.screen.width > 740 ? 50 : 25,
        fontColor: 'white',
        strokeColor: 'black',
        align: 'center',
        numOfInitLines: 2
    }
}

function updateCanvasWidth(canvasWidth) {
    gCanvasWidth = canvasWidth;
}

function updateCanvasHeight(canvasHeight) {
    gCanvasHeight = canvasHeight;
}


function initGmeme() {
    gMeme = {
        selectedImg: null,
        selectedLineIdx: 0,
        lines: _createInitialLines()
    }
}
function addLine() {
    gMeme.lines.push(_createLine());
}

function removeSelectedLine() {
    let lineToRemove = getSelectedLine();
    if (!lineToRemove) {
        return;
    }

    let lineToRemoveIdx = gMeme.lines.findIndex(line => line.id === lineToRemove.id);
    gMeme.lines.splice(lineToRemoveIdx, 1);
    gMeme.selectedLineIdx = lineToRemoveIdx + 1 > gMeme.lines.length - 1 ? gMeme.lines.length - 1 : lineToRemoveIdx + 1;
    if (gMeme.lines.length === 0) {
        gMeme.selectedLineIdx = null;
    }
}

function alignSelectedLine(textAlign) {
    let selectedLine = getSelectedLine();

    if (!selectedLine) {
        return;
    }

    selectedLine.align = textAlign;

    switch (textAlign) {
        case 'left':
            selectedLine.pos.x = 0;
            break;
        case 'center':
            selectedLine.pos.x = gCanvasWidth / 2;
            break;
        case 'right':
            selectedLine.pos.x = gCanvasHeight;
            break;
    }
}

function resetSelectedLine() {
    gMeme.selectedLineIdx = null;
}

function setSelectedLineById(lineId) {
    let selectedLineIdx = gMeme.lines.findIndex(line => line.id === lineId);
    if (selectedLineIdx !== null) {
        gMeme.selectedLineIdx = selectedLineIdx;
    }
}

function setNewLineAsSelected() {
    gMeme.selectedLineIdx = gMeme.lines.length - 1;
}

function setNextLineAsSelected() {
    if (gMeme.selectedLineIdx === null) {
        gMeme.selectedLineIdx = 0;
    }
    else {
        gMeme.selectedLineIdx++;
    }

    if (gMeme.selectedLineIdx > gMeme.lines.length - 1) {
        gMeme.selectedLineIdx = 0;
    }
}

function setSelectedLineYPos(yPosDiff) {
    let selectedLine = getSelectedLine();
    if (selectedLine) {
        selectedLine.pos.y += yPosDiff;
    }
}

function setSelectedLineFontFamily(fontFamily) {
    let selectedLine = getSelectedLine();
    if (selectedLine) {
        selectedLine.font = fontFamily;
    }
}

function setSelectedLineFontSize(fontSizeDiff) {
    let selectedLine = getSelectedLine();
    if (selectedLine) {
        selectedLine.fontSize += fontSizeDiff;
    }
}

function setSelectedLineFontColor(fontColor) {
    let selectedLine = getSelectedLine();
    if (selectedLine) {
        selectedLine.fontColor = fontColor;
    }
}

function setSelectedLineStrokeColor(strokeColor) {
    let selectedLine = getSelectedLine();
    if (selectedLine) {
        selectedLine.strokeColor = strokeColor;
    }
}

function setSelectedLineTxt(txt) {
    let selectedLine = getSelectedLine();
    if (selectedLine) {
        selectedLine.txt = txt;
    }
}

function getBgImg() {
    return gMeme.selectedImg;
}

function getAllTxtLines() {
    return gMeme.lines;
}

function setSelectedImgById(imgId) {
    let bgImg = gImages.find(img => img.id === imgId);
    gMeme.selectedImg = bgImg;
}

function getSelectedLine() {
    if (gMeme.selectedLineIdx === null) {
        return null;
    }

    return gMeme.lines[gMeme.selectedLineIdx];
}

function _createInitialLines() {
    let lines = [];

    for (let i = 0; i < gLineDefaults.numOfInitLines; i++) {
        lines.push(_createLine(i));
    }

    return lines;
}

function _createLine(lineIdx) {
    let line = {
        id: Math.round(Math.random() * 1000),
        txt: gLineDefaults.txt,
        placeholder: gLineDefaults.placeholder,
        font: gLineDefaults.font,
        fontSize: gLineDefaults.fontSize,
        fontColor: gLineDefaults.fontColor,
        strokeColor: gLineDefaults.strokeColor,
        align: gLineDefaults.align,
        pos: {
            x: gCanvasWidth / 2,
            y: _getLinePosYByIdx(lineIdx)
        },
        baseLine: _getLineBaseLineByIdx(lineIdx)
    }

    return line;
}

function _getLinePosYByIdx(lineIdx) {
    let posY;

    if (lineIdx === 0) {
        posY = 0;
    } else if (lineIdx === 1) {
        posY = gCanvasHeight;
    } else {
        posY = gCanvasHeight / 2;
    }

    return posY;
}


function _getLineBaseLineByIdx(lineIdx) {
    let baseLine;

    if (lineIdx === 0) {
        baseLine = 'top';
    } else if (lineIdx === 1) {
        baseLine = 'bottom';
    } else {
        baseLine = 'middle';
    }

    return baseLine;
}