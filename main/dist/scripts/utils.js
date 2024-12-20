"use strict";

function getPackageIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("packageID");
}

function showMessage(message, isSuccess) {
  const responseMessage = document.getElementById("responseMessage");
  responseMessage.style.display = "block";
  responseMessage.innerHTML = `<div class="alert ${isSuccess ? "alert-success" : "alert-danger"}">${message}</div>`;
  setTimeout(() => {
    responseMessage.style.display = "none";
  }, 5000);
}
