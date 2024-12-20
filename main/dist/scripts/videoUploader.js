"use strict";

function initializeVideoUploader() {
  const videoInput = document.getElementById("videoInput");
  const videoPreviewContainer = document.getElementById("videoPreviewContainer");
  const videoPreview = document.getElementById("videoPreview");
  const errorText = document.getElementById("errorText");
  const deleteVideoButton = document.getElementById("deleteVideoButton");

  videoInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      errorText.style.display = "block";
      this.value = "";
      return;
    }

    errorText.style.display = "none";
    const fileURL = URL.createObjectURL(file);
    displayVideo(fileURL);
  });

  deleteVideoButton.addEventListener("click", function () {
    videoInput.value = "";
    videoPreview.src = "";
    videoPreviewContainer.style.display = "none";
    errorText.style.display = "none";
  });
}

function displayVideo(videoUrl) {
  const videoPreview = document.getElementById("videoPreview");
  const videoPreviewContainer = document.getElementById("videoPreviewContainer");
  videoPreview.src = videoUrl;
  videoPreviewContainer.style.display = "block";
}
