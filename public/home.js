const fileInput = document.querySelector("#file");
const fileSelectorArea = document.querySelector("#fileSelector")
const button = document.querySelector("#submitBtn");
const loadingSpan = document.querySelector("#loading");

fileInput.addEventListener("change", (e) => {
    let file = e.target.value;
    
    let fileName = file.split("\\").pop();
    let fileNameAndType = fileName.split("."); // Divide o nome do arquivo Exemplo: arquivo.png => [arquivo, png] 

    if (fileNameAndType[0].length > 15) {
        fileName = fileNameAndType[0].slice(0, 15) + "... ." + fileNameAndType[1];
    }
    
    if (file) {
        button.disabled = false;
        fileSelectorArea.style.backgroundColor = "#bfffa8";
        fileSelectorArea.innerHTML = fileName + " selecionado";
    } else {
        button.disabled = true;
        fileSelectorArea.style.backgroundColor = "#fff";
        fileSelectorArea.innerHTML = "Selecione a foto da sua nota fiscal<br>(.png, .jpg, .pdf)";
    }
});


button.addEventListener("click", (e) => {
    loadingSpan.style.display = "inline-block"
});

// Animação de Loading

// let intervalId = null;

// function loading(delay){
//     if (intervalId) clearInterval(intervalId);

//     let dots = "";

//     intervalId = setInterval(()=>{
//         if (dots == "...") dots = ""
//         dots += "."; 
//         loadingSpan.innerHTML = dots;

//     }, delay);
// }

// loading(300)