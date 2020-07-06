'use strict'

let gElCanvas;
let gCtx;
let gBgImg;
let gIsSelectedLineNewAligend = false;

function init() {
    createLineDefaults();
    loadImages();
    gBgImg = new Image();
    renderImgGallery();
}

function onAboutNavBtnClick(elAboutBtn) {
    onNavBtnClick(elAboutBtn);
    hideElByClass('editor-container');
    displayElByClassAndType('gallery-container', 'flex');
    displayElByClassAndType('about-container', 'flex');
    let aboutLink = elAboutBtn.querySelector('a');
    aboutLink.click();
}

function onGalleryNavBtnClick(elGalleryBtn) {
    onNavBtnClick(elGalleryBtn);
    hideElByClass('editor-container');
    displayElByClassAndType('gallery-container', 'flex');
    displayElByClassAndType('about-container', 'flex');
}

function onNavBtnClick(elNavBtn) {
    disableAllNavBtns();
    elNavBtn.classList.add('active');
}

function disableAllNavBtns() {
    let elNavBtns = document.querySelectorAll('.main-nav li');
    elNavBtns.forEach(navBtn => navBtn.classList.remove('active'));
}

function displayElByClassAndType(elClass, displayType) {
    let el = document.querySelector(`.${elClass}`);
    el.style.display = displayType;
}

function hideElByClass(elClass) {
    let el = document.querySelector(`.${elClass}`);
    el.style.display = 'none';
}

// ---------- Gallery ----------

function onGalleryImageClick(elImg) {
    disableAllNavBtns();
    hideElByClass('gallery-container');
    hideElByClass('about-container');
    showEditor(elImg.dataset.imgid);
}

function renderImgGallery() {
    let elImgGallery = document.querySelector('.images-gallery');
    let images = getImages();
    images.forEach((image) => elImgGallery.innerHTML += getImgHtml(image));
}

function getImgHtml(image) {
    let imgWidth = 250;
    let imgHeight = 250;
    let imgHTML = `<img src="${image.url}" height="${imgHeight}" width="${imgWidth}" data-imgid=${image.id} class="gallery-image" onclick="onGalleryImageClick(this)">`;
    return imgHTML;
}

// ---------- Editor ----------

function hideEditor() {
    let elGallery = document.querySelector('.editor-container');
    elGallery.style.display = 'none';
}

function showEditor(bgImgId) {
    gElCanvas = document.getElementById('canvas');
    gCtx = gElCanvas.getContext('2d');
    setCanvasSizeByScreenSize(gElCanvas);
    updateCanvasWidth(gElCanvas.width);
    updateCanvasHeight(gElCanvas.height);
    initGmeme();
    setSelectedImgById(bgImgId);
    gBgImg.onload = () => {
        renderCanvas();
    }
    gBgImg.src = getBgImg().url;
    displayElByClassAndType('editor-container', 'flex');
    setInputLineTxtOfSelectedLine();
    let elEditor = document.querySelector('.editor-container');
    elEditor.scrollIntoView();
}

function renderCanvas() {
    gCtx.drawImage(gBgImg, 0, 0, gElCanvas.width, gElCanvas.height);
    drawTextLines();
}

function setCanvasSizeByScreenSize(elCanvas) {
    let screenWidth = window.screen.width;

    if (screenWidth <= 740) {
        elCanvas.width = 280;
        elCanvas.height = 280;
    }
}

function drawTextLines() {
    let txtLines = getAllTxtLines();
    let selectedLine = getSelectedLine();
    txtLines.forEach((txtLine) => drawTextLine(txtLine, selectedLine));
}

function drawTextLine(txtLine, selectedLine) {
    if (txtLine === selectedLine) {
        drawBgRect(txtLine);
    }
    let text = txtLine.txt ? txtLine.txt : txtLine.placeholder;
    gCtx.font = `${txtLine.fontSize}px ${txtLine.font}`;
    gCtx.textAlign = txtLine.align;
    gCtx.fillStyle = txtLine.fontColor;
    gCtx.strokeStyle = txtLine.strokeColor;
    gCtx.textBaseline = txtLine.baseLine;
    gCtx.fillText(text, txtLine.pos.x, txtLine.pos.y);
    gCtx.strokeText(text, txtLine.pos.x, txtLine.pos.y);
}

function drawBgRect(txtLine) {
    gCtx.beginPath();
    gCtx.fillStyle = 'rgba(104, 7, 249, 0.5)';
    let bgRectHeight = txtLine.fontSize;
    let posY = calcBgRectPosY(txtLine, bgRectHeight);
    gCtx.fillRect(0, posY, gElCanvas.width, bgRectHeight);
}

function calcBgRectPosY(txtLine, bgRectHeight) {
    let posY;

    if (txtLine.baseLine === 'top') {
        posY = txtLine.pos.y;
    } else if (txtLine.baseLine === 'bottom') {
        posY = txtLine.pos.y - bgRectHeight;
    } else { // baseline === 'middle'
        posY = txtLine.pos.y - (bgRectHeight / 2);
    }

    return posY;
}

function onCanvasMouseDown(ev) {
    let selectedLine = getSelectedLineFromCanvas(ev);
    gIsSelectedLineNewAligend = false;

    if (selectedLine) {
        setSelectedLineById(selectedLine.id);
        setInputLineTxtOfSelectedLine();
        renderCanvas();
        let mouseMoveListener = (event) => dragLine(event, selectedLine);
        gElCanvas.addEventListener('mousemove', mouseMoveListener);
        gElCanvas.addEventListener('mouseup', (event) => dropDraggedLine(event, mouseMoveListener));
        gElCanvas.addEventListener('mouseleave', (event) => dropDraggedLine(event, mouseMoveListener));
    }
}

function dragLine(ev, selectedLine) {
    let newPosX = ev.offsetX;
    let newPosY = ev.offsetY;
    selectedLine.baseLine = 'middle';
    if (!gIsSelectedLineNewAligend) {
        setNewTxtLineAlignment(selectedLine, ev);
        gIsSelectedLineNewAligend = true;
    }
    selectedLine.pos.x = newPosX;
    selectedLine.pos.y = newPosY;
    renderCanvas();
}

function setNewTxtLineAlignment(selectedLine, ev) {
    if (0 <= ev.offsetX && ev.offsetX < gElCanvas.width / 4) {
        selectedLine.align = 'left';
    } else if (gElCanvas.width / 4 <= ev.offsetX && event.offsetX < gElCanvas.width / 4 * 3) {
        selectedLine.align = 'center'
    } else {
        selectedLine.align = 'right';
    }
}

function dropDraggedLine(ev, dragEventListener) {
    gElCanvas.removeEventListener('mousemove', dragEventListener);
}

function getSelectedLineFromCanvas(ev) {
    let { offsetX, offsetY } = ev;
    let txtLines = getAllTxtLines();
    let selectedLine = txtLines.find(txtLine => isTxtLineInRange(txtLine, offsetX, offsetY));

    return selectedLine;
}

function isTxtLineInRange(txtLine, clickPosX, clickPosY) {
    let isInXRange = 0 < clickPosX && clickPosX < gElCanvas.width;
    let isInYRange;

    if (txtLine.baseLine === 'top') {
        isInYRange = txtLine.pos.y < clickPosY && clickPosY < txtLine.pos.y + txtLine.fontSize;
    } else if (txtLine.baseLine === 'bottom') {
        isInYRange = txtLine.pos.y - txtLine.fontSize < clickPosY && clickPosY < txtLine.pos.y;
    } else { // baseline === middle
        isInYRange = txtLine.pos.y - (txtLine.fontSize / 2) < clickPosY && clickPosY < txtLine.pos.y + (txtLine.fontSize / 2);
    }

    return isInXRange && isInYRange;
}

function onAddLine() {
    addLine();
    setNewLineAsSelected();
    setInputLineTxtOfSelectedLine();
    renderCanvas();
}

function onRemoveSelectedLine() {
    removeSelectedLine();
    setInputLineTxtOfSelectedLine();
    renderCanvas();
}

function onChangeLine() {
    setNextLineAsSelected();
    setInputLineTxtOfSelectedLine();
    renderCanvas();
}

function setInputLineTxtOfSelectedLine() {
    let elInputLine = document.querySelector('.text-line-input');
    let selectedLine = getSelectedLine();
    if (selectedLine && selectedLine.txt) {
        elInputLine.value = selectedLine.txt;
    } else if (selectedLine) {
        elInputLine.value = '';
        elInputLine.placeholder = selectedLine.placeholder;
    }
    elInputLine.focus();
}

function onTextLineInputChange(txt) {
    if (!txt) {
        setSelectedLineTxt('');
        setInputLineTxtOfSelectedLine();
    } else {
        setSelectedLineTxt(txt);
    }
    renderCanvas();
}

function onLineHeightChange(yPosDiff) {
    setSelectedLineYPos(yPosDiff);
    renderCanvas();
}

function onFontFamilyChange(fontFamily) {
    setSelectedLineFontFamily(fontFamily);
    renderCanvas();
}

function onFontSizeChange(fontDiff) {
    setSelectedLineFontSize(fontDiff);
    renderCanvas();
}

function onStrokeColorClick() {
    let elStrokeColorInput = document.querySelector('.text-stroke-color-input');
    elStrokeColorInput.click();
}

function onStrokeColorChange(strokeColor) {
    setSelectedLineStrokeColor(strokeColor);
    renderCanvas();
}
function onFontColorClick() {
    let elFontColorInput = document.querySelector('.text-font-color-input');
    elFontColorInput.click();
}

function onFontColorChange(fontColor) {
    setSelectedLineFontColor(fontColor);
    renderCanvas();
}

function onTextAlignChange(textAlign) {
    alignSelectedLine(textAlign);
    renderCanvas();
}

function onDownloadMeme(elDownloadLink) {
    resetSelectedLine();
    renderCanvas();
    let data = gElCanvas.toDataURL();
    elDownloadLink.href = data;
    elDownloadLink.download = 'meme.png';
}