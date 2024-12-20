"use strict";

let uploadedImagesCount = 0;
let selectedFiles = [];
let selectedCategoryId = null;
let originalMaterials = [];
let materialsToDelete = [];
let hasMaterials = false;
let availableMaterials = [];
let params = getPackageIdFromUrl();

document.addEventListener("DOMContentLoaded", async () => {
  await fetchCategories();
  await fetchAvailableMaterials();
  await fetchPackageDetails(params);
  await fetchAssignedMaterials(params);

  initializeMaterialsButtons();
  initializeProductTableLogic();
  initializeImageUploader();
  initializeVideoUploader();

  document
    .getElementById("submitButton")
    .addEventListener("click", updatePackage);
});

function fillInTheFields(data) {
  document.getElementById("packageName").value = data.Name;
  document.getElementById("packagePrice").value = data.Price;
  document.getElementById("packageQuantity").value = data.Quantity;
  document.getElementById("packageDescription").value = data.Description;

  const selectedCategoriesList = document.getElementById(
    "selectedCategoriesList"
  );
  selectedCategoriesList.innerHTML = "";
  if (data.SubCategory && data.SubCategory.Name) {
    const li = document.createElement("li");
    li.textContent = data.SubCategory.Name;
    li.setAttribute("data-value", data.SubCategory.SubCategoryID);
    selectedCategoryId = data.SubCategory.SubCategoryID;
    selectedCategoriesList.appendChild(li);
    li.style.fontWeight = "bold";
  }

  // Display selected products
  const selectedProductsBody = document.getElementById("selectedProductsBody");
  selectedProductsBody.innerHTML = "";
  if (data.PackageProduct && data.PackageProduct.length > 0) {
    data.PackageProduct.forEach((product) => {
      const row = document.createElement("tr");

      const productIdCell = document.createElement("td");
      productIdCell.innerHTML = `<strong>#${product.Product.ProductID}</strong>`;

      const productNameCell = document.createElement("td");
      productNameCell.textContent = product.Product.Name;

      const quantityCell = document.createElement("td");
      quantityCell.innerHTML = `
            <div class="input-group">
              <button class="btn btn-outline-secondary decrease-quantity">-</button>
              <input type="text" class="form-control text-center quantity-input" value="${product.Quantity}" readonly>
              <button class="btn btn-outline-secondary increase-quantity">+</button>
            </div>
          `;

      const mainQuantityCell = document.createElement("td");
      mainQuantityCell.classList.add("main-quantity");
      mainQuantityCell.textContent = product.Product.Quantity;

      const actionCell = document.createElement("td");
      actionCell.innerHTML = `
            <button class="btn btn-outline-danger remove-from-selected">
              <i class="icofont-ui-delete text-danger"></i>
            </button>
          `;

      actionCell
        .querySelector(".remove-from-selected")
        .addEventListener("click", () => {
          row.remove();
          const mainRow = Array.from(
            document.getElementById("tableBody").rows
          ).find(
            (r) => r.children[1].textContent.trim() === product.Product.Name
          );
          if (mainRow) {
            mainRow.querySelector(".add-to-selected").disabled = false;
          }
        });

      row.appendChild(productIdCell);
      row.appendChild(productNameCell);
      row.appendChild(quantityCell);
      row.appendChild(mainQuantityCell);
      row.appendChild(actionCell);

      selectedProductsBody.appendChild(row);
    });
  }
}

function displayPackageResources(data) {
    const uploadedImagesContainer = document.getElementById("uploaded-images");
    const videoPreviewContainer = document.getElementById("videoPreviewContainer");
    const videoPreview = document.getElementById("videoPreview");
  
    // Clear previous
    uploadedImagesContainer.innerHTML = "";
    videoPreviewContainer.style.display = "none";
    videoPreview.src = "";
    uploadedImagesCount = 0;
    selectedFiles = [];
  
    let allResources = [];
  
    // Include package-level resources if any
    if (data.Resource && data.Resource.length > 0) {
      allResources = allResources.concat(data.Resource);
    }
  
    // Include product-level resources
    if (data.PackageProduct && data.PackageProduct.length > 0) {
      data.PackageProduct.forEach(pkgProd => {
        if (pkgProd.Product && pkgProd.Product.Resource && pkgProd.Product.Resource.length > 0) {
          allResources = allResources.concat(pkgProd.Product.Resource);
        }
      });
    }
  
    console.log("All resources:", allResources);
  
    // Filter images and videos
    const images = allResources.filter(res => res.fileType.startsWith("image/"));
    const videos = allResources.filter(res => res.fileType.startsWith("video/"));
  
    // Display images
    images.forEach(image => {
      let normalizedPath = image.filePath.replace(/\\/g, "/");
      if (!normalizedPath.startsWith("/")) {
        normalizedPath = "/" + normalizedPath;
      }
      const src = `${baseURL}${normalizedPath}`;
      console.log("Image URL:", src);
  
      const imgElement = document.createElement("img");
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
      });
    });
  
    // Display first video if available
    if (videos.length > 0) {
      let normalizedPath = videos[0].filePath.replace(/\\/g, "/");
      if (!normalizedPath.startsWith("/")) {
        normalizedPath = "/" + normalizedPath;
      }
      const videoSrc = `${baseURL}${normalizedPath}`;
      console.log("Video URL:", videoSrc);
      videoPreview.src = videoSrc;
      videoPreviewContainer.style.display = "block";
    }
  }
  

// Example usage after fetching package details
fetchPackageDetails(packageID).then((data) => {
  fillInTheFields(data);
  displayCustomizations(data.Customization);
  // Now call displayPackageResources with the entire data object
  displayPackageResources(data);
});

async function updatePackage(e) {
  e.preventDefault();
  try {
    const name = document.getElementById("packageName").value.trim();
    const description = document
      .getElementById("packageDescription")
      .value.trim();
    const price = parseFloat(document.getElementById("packagePrice").value);
    const packageQuantity = parseInt(
      document.getElementById("packageQuantity").value,
      10
    );

    const subCategoryId = selectedCategoryId;

    if (
      !name ||
      !description ||
      isNaN(price) ||
      isNaN(packageQuantity) ||
      !subCategoryId
    ) {
      showMessage("Please fill out all fields correctly.", false);
      return;
    }

    const selectedProducts = [];
    document.querySelectorAll("#selectedProductsBody tr").forEach((row) => {
      const productName = row.children[1].textContent.trim();
      const productQuantity = parseInt(
        row.querySelector(".quantity-input").value,
        10
      );
      selectedProducts.push({
        productName,
        quantity: productQuantity,
      });
    });

    const formData = new FormData();
    formData.append("Name", name);
    formData.append("Description", description);
    formData.append("Price", price);
    formData.append("Quantity", packageQuantity);
    formData.append("SubCategoryId", subCategoryId);
    formData.append("products", JSON.stringify(selectedProducts));

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    const videoFile = document.getElementById("videoInput").files[0];
    if (videoFile) {
      formData.append("videos", videoFile);
    }

    const authToken = sessionStorage.getItem("authToken");
    const response = await fetch(`${baseURL}/api/packages/${params}`, {
      method: "PUT",
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Success:", result);

    localStorage.setItem("responseMessage", "Package updated successfully!");
    localStorage.setItem("responseSuccess", "true");

    window.location.reload();
  } catch (error) {
    console.error("Error submitting the package:", error);
    showMessage(
      "An error occurred while updating the package. Check the console.",
      false
    );
  }
}

window.addEventListener("load", () => {
  const message = localStorage.getItem("responseMessage");
  const isSuccess = localStorage.getItem("responseSuccess") === "true";

  if (message) {
    showMessage(message, isSuccess);
    localStorage.removeItem("responseMessage");
    localStorage.removeItem("responseSuccess");
  }
});
