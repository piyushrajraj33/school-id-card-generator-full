const input = document.getElementById("photoInput")
const img = document.getElementById("previewImg")
const placeholder = document.getElementById("photoPlaceholder")

input.addEventListener("change", function(){

const file = this.files[0]

if(file){

img.src = URL.createObjectURL(file)
img.style.display = "block"

if(placeholder){
placeholder.style.display = "none"
}

}

})