// Global Selections and Variables
const colorDivs = document.querySelectorAll('.color')
const generateBtn = document.querySelector('.generate')
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const copyPopup = document.querySelector('.copy-container')
const adjustButton = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const lockBtns = document.querySelectorAll('.lock');
let initialcolors;
//Local storage
let savedPalettes = [];


// Event Listeners
sliders.forEach(slider => {
    slider.addEventListener("input", hslcontrols)
});

colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
    updateTextUI(index); 
    })
})

//copies hex codes when clicked on h2
currentHexes.forEach(hex => {
    hex.addEventListener('click', ()=> {
        copyToClipboard(hex);
    })
})

//close copy popup after animation end
copyPopup.addEventListener('transitionend', ()=> {
    const popupBox = copyPopup.children[0];
    popupBox.classList.remove('active');
    copyPopup.classList.remove('active');
})

//adjustment panel open on clicking adjustment button
adjustButton.forEach((button,index) => {
    button.addEventListener('click', () => {openAdjustmentPanel(index)})
})

closeAdjustments.forEach((button,index) => {
    button.addEventListener('click',() => {closeAdjustmentPanel(index)})
})

generateBtn.addEventListener('click', randomColors)

//lock feature
lockBtns.forEach(lock => {
    lock.addEventListener('click',(e) => lockColor(e))
})


// Functions

// generates random colors and assigns to all blocks
function randomColors() {
    // empty array, to store the color values
    initialcolors =[];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        const icons = div.querySelectorAll('.controls button');

        if(div.classList.contains('locked')) {
            initialcolors.push(hexText.innerText);
            return;
        }
        else {
            
        initialcolors.push(chroma(randomColor).hex());
        }

        // Add color to div style
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        // Check for contrast
        checkTextContrast(randomColor,hexText);
        for(icon of icons) {
            checkTextContrast(randomColor, icon);
        }
    
        // Initial Colorize Sliders
        const color = chroma(randomColor);
        const sliderInputs = div.querySelectorAll('.sliders input');
        const hue = sliderInputs[0];
        const brigtness = sliderInputs[1];
        const saturation = sliderInputs[2];
        
        colorizeSliders(color,hue,brigtness,saturation);    
    });
    resetInputs();
}

//Generate random color using chroma.js and return hexColor
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}

/* Check the luminance of the background,
 if the color is too dark the h2 text will be white and vice versa. */
function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}
function colorizeSliders(color,hue,brigtness,saturation) {
    // Scale saturation
    const noSat = color.set('hsl.s',0);
    const fullSat = color.set('hsl.s',1);
    const scaleSat = chroma.scale([noSat,color,fullSat]);

    //Scale brightness
    const midBright = color.set('hsl.l', 0.5)
    const scaleBright = chroma.scale(['black', midBright, 'white']);

    //Scale hue
    const scaleHue = chroma.scale();

    //Update input colors
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)} )`
    brigtness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${midBright}, ${scaleBright(1)} )`
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`
    
}

// main purpose is to change the background color of the active color block to correspond with the slider values
function hslcontrols(e) {
    //finds which div you are selecting the input slider on (0-5) and assign it to index
    const index = 
        e.target.getAttribute("data-hue") ||
        e.target.getAttribute("data-bright") || 
        e.target.getAttribute("data-sat");
    
    // find each slider in a div and assign them to hue, brightness and saturation to find their values
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    //find current bgColor from the h2 of the div
    const bgColor = initialcolors[index];

    // change the bgColor's hsl(hue,saturation, lightness) properties according to the input from the sliders
    let color = chroma(bgColor)
    .set('hsl.s',saturation.value)
    .set('hsl.h', hue.value)
    .set('hsl.l', brightness.value);

    //set the new color to the bgColor of the div
    colorDivs[index].style.backgroundColor = color;

    //update slider/input colors
    colorizeSliders(color,hue,brightness,saturation);
    
}

// update color block h2 Text, contrast after changing slider values
function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor).hex();
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    //set h2 value to the background.
    textHex.innerText = color;
    // check and change text and controls color to contrast with the bg color of the color block
    checkTextContrast(color,textHex);
    for(icon of icons) {
        checkTextContrast(color,icon);
    }

}

function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if(slider.name === "hue") {
            const hueColor = initialcolors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
            
        }
        if(slider.name === "brightness") {
            const brightColor = initialcolors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue*100) /100;
        }
        if(slider.name === "saturation") {
            const satColor = initialcolors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue*100) /100;
        }
    })
}

function copyToClipboard(hex) {
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();

    //popup animation
    const popupBox = copyPopup.children[0];
    copyPopup.classList.add('active');
    popupBox.classList.add('active');
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove('active');
}

function lockColor(e) {
    const lock = e.target;
    lock.children[0].classList.toggle('fa-lock-open');
    lock.children[0].classList.toggle('fa-lock');
    const activeDiv = lock.parentNode.parentNode;
    activeDiv.classList.toggle('locked');
}

//Implement savetoPalette and local storage
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');
const pickColorBtn = document.querySelector('.pick-palette-btn')

//event listener

saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closeSavePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary)


//functions
function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
    
}

function closeSavePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function openLibrary(e) {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');

}

function closeLibrary(e) {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
    
}
//close palette, sends message with name of palette, 
// creates new array of colors and store all colors to it
function savePalette(e) {
    const popup = saveContainer.children[0];
    const paletteName = saveInput.value;
    const colors = [];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');

    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    })

    //palette number //bugfixed
    let paletteNr;
    const localPalettes = JSON.parse(localStorage.getItem('palettes'));
    if(localPalettes){
        paletteNr = localPalettes.length;
    } else {
        paletteNr = savedPalettes.length;
    }
    
    //create a JSON object with details of the palette
    const paletteObj = {
        name: paletteName,
        colors,
        nr: paletteNr,
    }
    //push the palette to the savedPalettes array
    savedPalettes.push(paletteObj);
    //save them to local storage
    savetoLocal(paletteObj);
    saveInput.value = "";

    //generate palette for library
    createColorPalette(paletteObj);

}

function savetoLocal(paletteObj) {
    let localPalettes;
    if(localStorage.getItem('palettes') ===null){
        localPalettes = [];
    }
    else{
        //parse is used as the value is stored as strings
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
        
    }
    localPalettes.push(paletteObj);
    //localStorage.setItem('key','string value');
    localStorage.setItem('palettes',JSON.stringify(localPalettes))
}

function getLocal() {
    let localPalettes;
    if(localStorage.getItem('palettes') ===null){
        localPalettes = [];
    }
    else{
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {
        //generate palette for library
        createColorPalette(paletteObj);
            })
        }
}

function createColorPalette(paletteObj) {
    //generate palette for library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');

    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    
    paletteObj.colors.forEach((color,index) => {
        const smallColor= document.createElement('div');
        smallColor.style.background = color;
        smallColor.classList.add('small-color');
        preview.appendChild(smallColor);
        

    });

    const pickColorBtn = document.createElement('button');
    pickColorBtn.classList.add('pick-palette-btn');
    pickColorBtn.classList.add(paletteObj.nr);
    pickColorBtn.innerText = "Select";

    pickColorBtn.addEventListener('click', e => {
        const paletteIndex = e.target.classList[1];
        closeLibrary();

        initialcolors = [];
        savedPalettes[paletteIndex].colors.forEach((color,index) => {
            initialcolors.push(color);
            colorDivs[index].style.backgroundColor = color;
            colorDivs[index].children[0].innerText = color;
            checkTextContrast(color,colorDivs[index].children[0]);
            updateTextUI(index);
        })
        resetInputs();

    })

    const deleteColorBtn = document.createElement('button');
    deleteColorBtn.classList.add('delete-palette-btn');
    deleteColorBtn.classList.add(paletteObj.nr);
    deleteColorBtn.innerText = "Delete";
    deleteColorBtn.addEventListener('click', e => {
        const paletteIndex = e.target.classList[1];
        deletePalette(paletteIndex);
    });
    
    palette.appendChild(title);    
    palette.appendChild(preview);
    palette.appendChild(pickColorBtn);  
    palette.appendChild(deleteColorBtn); 
    const libaryPopup = libraryContainer.children[0];
    libaryPopup.appendChild(palette);
}

function deletePalette(paletteIndex) {
    const libaryPopup = libraryContainer.children[0];
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    paletteObjects.splice(paletteIndex,1)
    console.log(paletteObjects)
    localStorage.setItem('palettes',JSON.stringify(paletteObjects));
    savedPalettes = [...paletteObjects];
    location.reload();
}

getLocal();
randomColors();

// localStorage.clear();


