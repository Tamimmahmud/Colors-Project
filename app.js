// Global Selections and Variables
const colorDivs = document.querySelectorAll('.color')
const generateBtn = document.querySelector('.generate')
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
let initialcolors;

// Event Listeners
sliders.forEach(slider => {
    slider.addEventListener("input", hslcontrols)
});

colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
    updateTextUI(index); 
    })
})

// Functions

// generates random colors and assigns to all blocks
function randomColors() {
    // empty array, to store the color values
    initialcolors =[];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        initialcolors.push(chroma(randomColor).hex());

        // Add color to div style
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        // Check for contrast
        checkTextContrast(randomColor,hexText);
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

randomColors();

// Event Listeners

