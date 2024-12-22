$(document).ready(function () {
  //Ch-editer
  ClassicEditor.create(document.querySelector("#editor")).catch((error) => {
    console.error(error);
  });
  //Deleterow
  $("#tbproduct").on("click", ".deleterow", function () {
    $(this).closest("tr").remove();
  });
});

$(function () {
  $(".dropify").dropify();

  var drEvent = $("#dropify-event").dropify();
  drEvent.on("dropify.beforeClear", function (event, element) {
    return confirm(
      'Do you really want to delete "' + element.file.name + '" ?'
    );
  });

  drEvent.on("dropify.afterClear", function (event, element) {
    alert("File deleted");
  });

  $(".dropify-fr").dropify({
    messages: {
      default: "Glissez-dÃ©posez un fichier ici ou cliquez",
      replace: "Glissez-dÃ©posez un fichier ou cliquez pour remplacer",
      remove: "Supprimer",
      error: "DÃ©solÃ©, le fichier trop volumineux",
    },
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const categoryNameInput = document.getElementById("categoryName");
  const isActiveCheckbox = document.getElementById("isActive");
  const imageInput = document.getElementById("dropify-event");
  const saveButton = document.querySelector(".btn-primary");
  const messageParagraph = document.getElementById("message");

  // Event listener for form submission
  saveButton.addEventListener("click", async (e) => {
    e.preventDefault();

    // Clear any existing message
    messageParagraph.textContent = "";

    // Collect form data
    const formData = new FormData();
    const categoryName = categoryNameInput.value.trim();
    const isActive = isActiveCheckbox.checked;
    const imageFile = imageInput.files[0];

    if (!categoryName) {
      messageParagraph.textContent = "Category name is required!";
      messageParagraph.style.color = "red";
      return;
    }

    formData.append("Name", categoryName);
    formData.append("IsActive", isActive);
    if (imageFile) {
      formData.append("file", imageFile);
    }
    if (!imageFile) {
      messageParagraph.textContent = "Image is required!";
      messageParagraph.style.color = "red";
      return;
    }

    try {
      // Make API request to create category
      const response = await fetch("http://35.234.135.60:5000/api/categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        messageParagraph.textContent = "Category added successfully!";
        messageParagraph.style.color = "green";
        console.log("Created Category:", result);
        // Optionally clear the form
        form.reset();
      } else if (result.message === "Category already exists") {
        messageParagraph.textContent = "Category name already exists!";
        messageParagraph.style.color = "red";
      } else {
        messageParagraph.textContent = `Error: ${
          result.message || "Could not create category"
        }`;
        messageParagraph.style.color = "red";
      }
    } catch (error) {
      console.error("Error:", error);
      messageParagraph.textContent =
        "An error occurred while creating the category.";
      messageParagraph.style.color = "red";
    }
  });
});
