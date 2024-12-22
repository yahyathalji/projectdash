// assets/js/productEdit.js

"use strict";

// Utility function to get product ID from URL
function getUserIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("productId");
}

// ---------------------------- Document Ready ----------------------------
document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});

async function initializePage() {
  const authToken = sessionStorage.getItem("authToken");
  if (!authToken) {
    alert("You are not authenticated. Please log in first.");
    window.location.href = "login.html"; // Redirect to your login page
    return;
  }

  const productId = getUserIdFromURL();
  console.log("Product ID:", productId);

  // Initialize Event Listeners
  initializeCategorySelection();
  initializeImageUploader();
  initializeVideoUploader();
  initializeFormSubmission();

  // Fetch and populate categories first
  await fetchAndPopulateCategories();

  if (productId) {
    await fetchAndPopulateProductData(productId);
  }
}

// ---------------------------- Fetch Categories ----------------------------
async function fetchAndPopulateCategories() {
  try {
    const response = await fetch(
      "http://35.234.135.60:5000/api/categories/subcategories",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      const categorySelect = document.getElementById("categorySelect");

      // Clear existing options if any
      categorySelect.innerHTML =
        '<option value="" disabled selected>Select a Subcategory</option>';

      // Loop through the categories and add only those with subcategories
      data.forEach((category) => {
        if (category.SubCategory && category.SubCategory.length > 0) {
          const optgroup = document.createElement("optgroup");
          optgroup.label = category.Name;

          // Loop through subcategories and add them as options
          category.SubCategory.forEach((subCategory) => {
            const option = document.createElement("option");
            option.value = subCategory.SubCategoryID; // Store SubCategory ID in the option's value
            option.textContent = subCategory.Name;
            optgroup.appendChild(option);
          });

          // Append optgroup to the select element
          categorySelect.appendChild(optgroup);
        }
      });
    } else {
      console.error(
        "Error fetching categories:",
        data.message || "Unknown error"
      );
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

// ---------------------------- Category Selection ----------------------------
function initializeCategorySelection() {
  const categorySelect = document.getElementById("categorySelect");
  const selectedCategoriesList = document.getElementById(
    "selectedCategoriesList"
  );

  // Event listener for double-click on options (single selection)
  categorySelect.addEventListener("dblclick", function (event) {
    const selectedOption = event.target;

    // Check if the target is a valid <option> and it's not disabled
    if (selectedOption.tagName === "OPTION" && !selectedOption.disabled) {
      // Clear previously selected category from the list to allow only one selection
      selectedCategoriesList.innerHTML = "";

      // Create a list item to add to the selected category list
      const listItem = document.createElement("li");
      listItem.textContent = selectedOption.textContent; // Use the option's text as the list item text
      listItem.setAttribute("data-value", selectedOption.value); // Store the value for later use

      // Add the item to the list
      selectedCategoriesList.appendChild(listItem);

      // Disable the selected option to prevent re-selection
      selectedOption.disabled = true;
    }
  });

  // Event listener for clicking on the selected category to remove it
  selectedCategoriesList.addEventListener("click", function (event) {
    const clickedItem = event.target;

    if (clickedItem.tagName === "LI") {
      const value = clickedItem.getAttribute("data-value");

      // Remove the item from the selected list
      clickedItem.remove();

      // Re-enable the option in the original list
      const option = categorySelect.querySelector(`option[value="${value}"]`);
      if (option) option.disabled = false;
    }
  });
}

// ---------------------------- Image Uploader ----------------------------
function initializeImageUploader() {
  const imageUploader = document.getElementById("image-uploader");
  const uploadedImagesContainer = document.getElementById("uploaded-images");
  const fileLimitWarning = document.getElementById("file-limit-warning");
  const fileSizeWarning = document.getElementById("file-size-warning");
  let uploadedImagesCount = uploadedImagesContainer.children.length;
  let selectedFiles = [];

  imageUploader.addEventListener("change", function (event) {
    const files = event.target.files;
    let validFiles = [];

    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        fileSizeWarning.style.display = "block";
      } else {
        fileSizeWarning.style.display = "none";
        validFiles.push(file);
      }
    });

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
        removeButton.className =
          "btn btn-sm btn-danger position-absolute top-0 end-0";
        removeButton.style.margin = "-5px";
        removeButton.style.zIndex = "1";

        const wrapper = document.createElement("div");
        wrapper.className = "position-relative d-inline-block";
        wrapper.style.position = "relative"; // Ensure positioning
        wrapper.appendChild(imgElement);
        wrapper.appendChild(removeButton);

        uploadedImagesContainer.appendChild(wrapper);

        removeButton.addEventListener("click", () => {
          wrapper.remove();
          uploadedImagesCount--;
          fileLimitWarning.style.display = "none";
          // Remove from selectedFiles
          selectedFiles = selectedFiles.filter((f) => f !== file);
        });
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  });

  // Expose selectedFiles for form submission
  window.getSelectedFiles = function () {
    return selectedFiles;
  };
}

// ---------------------------- Video Uploader ----------------------------
function initializeVideoUploader() {
  const videoInput = document.getElementById("videoInput");
  const videoPreviewContainer = document.getElementById(
    "videoPreviewContainer"
  );
  const videoPreview = document.getElementById("videoPreview");
  const errorText = document.getElementById("errorText");
  const deleteVideoButton = document.getElementById("deleteVideoButton");

  videoInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
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

// ---------------------------- Display Functions ----------------------------
function displayImage(fileOrUrl, isFile = true) {
  const uploadedImagesContainer = document.getElementById("uploaded-images");
  const fileLimitWarning = document.getElementById("file-limit-warning");
  let uploadedImagesCount = uploadedImagesContainer.children.length;

  if (uploadedImagesCount >= 5) {
    fileLimitWarning.style.display = "block";
    return;
  }

  uploadedImagesCount++;

  const imgElement = document.createElement("img");
  const src = isFile
    ? URL.createObjectURL(fileOrUrl)
    : `http://35.234.135.60:5000/${fileOrUrl.replace(/\\/g, "/")}`;
  imgElement.src = src;
  imgElement.style.width = "100px";
  imgElement.style.height = "100px";
  imgElement.style.objectFit = "cover";
  imgElement.className = "rounded border";

  const removeButton = document.createElement("button");
  removeButton.innerHTML = "&times;";
  removeButton.className =
    "btn btn-sm btn-danger position-absolute top-0 end-0";
  removeButton.style.margin = "-5px";
  removeButton.style.zIndex = "1";

  const wrapper = document.createElement("div");
  wrapper.className = "position-relative d-inline-block";
  wrapper.style.position = "relative"; // Ensure positioning
  wrapper.appendChild(imgElement);
  wrapper.appendChild(removeButton);

  uploadedImagesContainer.appendChild(wrapper);

  removeButton.addEventListener("click", () => {
    wrapper.remove();
    uploadedImagesCount--;
    fileLimitWarning.style.display = "none";
  });
}

function displayVideo(videoUrl) {
  const videoPreview = document.getElementById("videoPreview");
  const videoPreviewContainer = document.getElementById(
    "videoPreviewContainer"
  );
  videoPreview.src = videoUrl;
  videoPreviewContainer.style.display = "block";
}

// ---------------------------- Customization Display ----------------------------
function displayCustomizations(customizations) {
  const customizationContainer = document.getElementById(
    "customizationContainer"
  );

  if (!customizationContainer) {
    console.error("Customization container not found in the HTML.");
    return;
  }

  // Clear existing customizations to prevent duplicates
  customizationContainer.innerHTML = "";

  customizations.forEach((customization) => {
    const customizationCard = document.createElement("div");
    customizationCard.className = "card mb-3";
    customizationCard.setAttribute(
      "data-customization-id",
      customization.CustomizationID
    );

    const customizationHeader = document.createElement("div");
    customizationHeader.className =
      "card-header py-3 d-flex justify-content-between align-items-center bg-transparent border-bottom-0";
    customizationHeader.innerHTML = `
            <h6 class="mb-0 fw-bold">${customization.option.name} (${customization.option.type})</h6>
            <button type="button" class="btn btn-danger btn-sm delete-customization">Delete</button>
        `;

    const customizationBody = document.createElement("div");
    customizationBody.className = "card-body";
    const optionsList = document.createElement("ul");
    optionsList.className = "list-group list-group-flush";

    customization.option.optionValues.forEach((optionValue) => {
      const listItem = document.createElement("li");
      listItem.className =
        "list-group-item d-flex justify-content-between align-items-center";
      listItem.textContent = optionValue.name;
      if (optionValue.value) {
        listItem.textContent += ` - ${optionValue.value}`;
      }
      optionsList.appendChild(listItem);
    });

    customizationBody.appendChild(optionsList);
    customizationCard.appendChild(customizationHeader);
    customizationCard.appendChild(customizationBody);
    customizationContainer.appendChild(customizationCard);
  });
}

// ---------------------------- Customization Deletion ----------------------------
document.addEventListener("click", async function (event) {
  if (event.target && event.target.classList.contains("delete-customization")) {
    const customizationCard = event.target.closest(".card");
    const customizationId = customizationCard.getAttribute(
      "data-customization-id"
    );
    const productId = getUserIdFromURL();

    if (!customizationId || !productId) {
      alert("Customization ID or Product ID is missing.");
      return;
    }

    if (confirm("Are you sure you want to delete this customization?")) {
      // Call API to delete customization
      const response = await fetch(
        `http://35.234.135.60:5000/api/customization/product`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            customizationId: parseInt(customizationId),
            productIds: [parseInt(productId)],
          }),
        }
      );

      if (response.status == 200) {
        const data = await response.json();
        if (data.success) {
          customizationCard.remove();
          alert("Customization deleted successfully.");
        } else {
          console.error(
            "Error deleting customization:",
            data.message || "Unknown error"
          );
          alert("An error occurred while deleting the customization.");
        }
      } else {
        console.error("Error deleting customization:", response.statusText);
        alert("An error occurred while deleting the customization.");
      }
    }
  }
});

// ---------------------------- Form Submission ----------------------------
function initializeFormSubmission() {
  document
    .getElementById("EditProductForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const productId = getUserIdFromURL();

      if (!productId) {
        alert("Product ID is missing from the URL.");
        return;
      }

      const formData = new FormData();
      formData.append("Name", document.getElementById("productName").value);
      formData.append("Price", document.getElementById("price").value);
      formData.append("Quantity", document.getElementById("quantity").value);
      formData.append(
        "Description",
        document.getElementById("description").value
      );
      formData.append(
        "SubCategoryID",
        document.getElementById("categorySelect").value
      );
      formData.append(
        "BrandName",
        document.getElementById("brandSelect").value
      );
      formData.append(
        "Material",
        document.getElementById("materialSelect").value
      );

      // Append images
      const selectedFiles = window.getSelectedFiles
        ? window.getSelectedFiles()
        : [];
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Add video
      const video = document.getElementById("videoInput").files[0];
      if (video) {
        formData.append("videos", video);
      }

      console.log("Form Data:", Array.from(formData.entries()));

      fetch(`http://35.234.135.60:5000/api/product/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          // Note: When using FormData, do not set 'Content-Type' header manually.
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((response) => {
          const responseMessage = document.getElementById("responseMessage");
          if (response.success) {
            responseMessage.innerHTML =
              '<div class="alert alert-success">Product updated successfully!</div>';
          } else {
            responseMessage.innerHTML = `<div class="alert alert-danger">${response.message}</div>`;
          }

          setTimeout(() => {
            responseMessage.innerHTML = "";
          }, 3000);
        })
        .catch((error) => {
          console.error("Error updating product:", error);
          const responseMessage = document.getElementById("responseMessage");
          responseMessage.innerHTML =
            '<div class="alert alert-danger">Failed to update product.</div>';
        });
    });
}

// ---------------------------- Fetch and Populate Product Data ----------------------------
async function fetchAndPopulateProductData(productId) {
  try {
    const response = await fetch(
      `http://35.234.135.60:5000/api/getProduct/${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      }
    );

    const productData = await response.json();

    if (response.ok && productData) {
      // Populate basic fields
      document.getElementById("productName").value = productData.Name || "";
      document.getElementById("price").value = productData.Price || "";
      document.getElementById("quantity").value = productData.Quantity || "";
      document.getElementById("description").value =
        productData.Description || "";
      document.getElementById("materialSelect").value =
        productData.Material || "";
      document.getElementById("brandSelect").value =
        productData.Brand?.Name || "";

      // Handle Selected Subcategory
      if (productData.SubCategory && productData.SubCategory.SubCategoryID) {
        const subCategoryId = productData.SubCategory.SubCategoryID;
        const subCategoryName =
          productData.SubCategory.Name || "Unnamed Category";
        const categorySelect = document.getElementById("categorySelect");

        // Find and select the option in the select element
        const optionToSelect = categorySelect.querySelector(
          `option[value="${subCategoryId}"]`
        );
        if (optionToSelect) {
          optionToSelect.selected = true;
          optionToSelect.disabled = true; // Disable to prevent re-selection

          // Add to selectedCategoriesList
          const selectedCategoriesList = document.getElementById(
            "selectedCategoriesList"
          );
          const listItem = document.createElement("li");
          listItem.textContent = subCategoryName;
          listItem.setAttribute("data-value", subCategoryId);
          selectedCategoriesList.appendChild(listItem);
        } else {
          console.error("SubCategory option not found in the select element.");
        }
      } else {
        console.error("SubCategoryID not found");
      }

      // Display Images
      const imageResources = productData.Resource.filter((resource) =>
        resource.fileType.startsWith("image/")
      );
      imageResources.forEach((image) => displayImage(image.filePath, false));

      // Display Video
      const videoResources = productData.Resource.filter((resource) =>
        resource.fileType.startsWith("video/")
      );
      if (videoResources.length > 0) {
        const videoUrl = `http://35.234.135.60:5000/${videoResources[0].filePath.replace(
          /\\/g,
          "/"
        )}`;
        displayVideo(videoUrl);
      }

      // Display Customizations
      displayCustomizations(productData.Customization);
    } else {
      console.error(
        "Error fetching product data:",
        productData.message || "Unknown error"
      );
    }
  } catch (error) {
    console.error("Error fetching product data:", error);
  }
}
