"use strict";

function initializeImageUploader() {
  const imageUploader = document.getElementById("image-uploader");
  const uploadedImagesContainer = document.getElementById("uploaded-images");
  const fileLimitWarning = document.getElementById("file-limit-warning");
  const fileSizeWarning = document.getElementById("file-size-warning");
  uploadedImagesCount = uploadedImagesContainer.children.length;
  selectedFiles = [];

  imageUploader.addEventListener("change", function (event) {
    const files = event.target.files;
    let validFiles = [];
    let sizeExceeded = false;

    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        sizeExceeded = true;
      } else {
        validFiles.push(file);
      }
    });

    if (sizeExceeded) {
      fileSizeWarning.style.display = "block";
    } else {
      fileSizeWarning.style.display = "none";
    }

    if (uploadedImagesCount + validFiles.length > 5) {
      fileLimitWarning.style.display = "block";
      event.target.value = "";
      return;
    }

    fileLimitWarning.style.display = "none";

    validFiles.forEach((file) => {
      uploadedImagesCount++;
      selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = function (e) {
        const imgElement = document.createElement("img");
        imgElement.src = e.target.result;
        imgElement.style.width = "100px";
        imgElement.style.height = "100px";
        imgElement.style.objectFit = "cover";
        imgElement.className = "rounded border uploaded-image";

        const removeButton = document.createElement("button");
        removeButton.innerHTML = "&times;";
        removeButton.className = "btn btn-sm btn-danger position-absolute top-0 end-0";
        removeButton.style.margin = "-5px";
        removeButton.style.zIndex = "1";

        const wrapper = document.createElement("div");
        wrapper.className = "position-relative d-inline-block";
        wrapper.style.position = "relative";
        wrapper.appendChild(imgElement);
        wrapper.appendChild(removeButton);

        uploadedImagesContainer.appendChild(wrapper);

        removeButton.addEventListener("click", () => {
          wrapper.remove();
          uploadedImagesCount--;
          selectedFiles = selectedFiles.filter((f) => f !== file);
          fileLimitWarning.style.display = "none";
        });
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  });
}

function displayImage(filePath) {
  const uploadedImagesContainer = document.getElementById("uploaded-images");
  const fileLimitWarning = document.getElementById("file-limit-warning");

  uploadedImagesCount = uploadedImagesContainer.children.length;
  if (uploadedImagesCount >= 5) {
    fileLimitWarning.style.display = "block";
    return;
  }

  uploadedImagesCount++;
  const imgElement = document.createElement("img");
  const src = `${baseURL}${filePath.replace(/\\/g, "/")}`;

  imgElement.src = src;
  imgElement.style.width = "100px";
  imgElement.style.height = "100px";
  imgElement.style.objectFit = "cover";
  imgElement.className = "rounded border";

  const removeButton = document.createElement("button");
  removeButton.innerHTML = "&times;";
  removeButton.className = "btn btn-sm btn-danger position-absolute top-0 end-0";
  removeButton.style.margin = "-5px";
  removeButton.style.zIndex = "1";

  const wrapper = document.createElement("div");
  wrapper.className = "position-relative d-inline-block";
  wrapper.style.position = "relative";
  wrapper.appendChild(imgElement);
  wrapper.appendChild(removeButton);

  uploadedImagesContainer.appendChild(wrapper);

  removeButton.addEventListener("click", () => {
    wrapper.remove();
    uploadedImagesCount--;
    fileLimitWarning.style.display = "none";
  });
}
