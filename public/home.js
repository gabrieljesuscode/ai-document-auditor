const fileInput = document.querySelector("#file");
const fileSelectorArea = document.querySelector("#fileSelector")

fileInput.addEventListener("change", (e) => {
    let file = e.target.value;
    
    let fileName = file.split("\\").pop();
    
    if (file) {
        fileSelectorArea.style.backgroundColor = "#bfffa8";
        fileSelectorArea.innerHTML = fileName + " selecionado";
    }
});