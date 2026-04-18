const input = document.getElementById("photoInput")
const img = document.getElementById("previewImg")
const placeholder = document.getElementById("photoPlaceholder")

input.addEventListener("change", function () {

  const file = this.files[0]
  if (!file) return

  // 🚨 Optional: limit before processing
  if (file.size > 5 * 1024 * 1024) {
    alert("Please select image below 5MB")
    return
  }

  const reader = new FileReader()

  reader.onload = function (e) {

    const image = new Image()

    image.onload = function () {

      // 🔥 CREATE CANVAS (for compression)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      const MAX_WIDTH = 400   // 👈 adjust if needed
      const scale = MAX_WIDTH / image.width

      canvas.width = MAX_WIDTH
      canvas.height = image.height * scale

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      // 🔥 COMPRESS IMAGE
      canvas.toBlob(function (blob) {

        const compressedFile = new File(
          [blob],
          file.name,
          {
            type: "image/jpeg",
            lastModified: Date.now()
          }
        )

        // 🔥 Replace original file
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(compressedFile)
        input.files = dataTransfer.files

        console.log("Original:", file.size)
        console.log("Compressed:", compressedFile.size)

      }, "image/jpeg", 0.8) // 👈 quality (0.7 best balance)

      // ✅ SHOW PREVIEW (same as your old logic)
      img.src = e.target.result
      img.style.display = "block"

      if (placeholder) {
        placeholder.style.display = "none"
      }

    }

    image.src = e.target.result
  }

  reader.readAsDataURL(file)
})