"use strict";

// Fetch categories
async function fetchCategories() {
  try {
    const authToken = sessionStorage.getItem("authToken");
    const response = await fetch(`${baseURL}/api/categories/subcategories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });
    const data = await response.json();
    populateCategories(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

function populateCategories(data) {
  const categorySelect = document.getElementById("categorySelect");
  data.forEach((category) => {
    if (category.SubCategory && category.SubCategory.length > 0) {
      const optgroup = document.createElement("optgroup");
      optgroup.label = category.Name;

      category.SubCategory.forEach((subCategory) => {
        const option = document.createElement("option");
        option.value = subCategory.SubCategoryID;
        option.textContent = subCategory.Name;
        optgroup.appendChild(option);
      });

      categorySelect.appendChild(optgroup);
    }
  });
}

// Fetch available materials
async function fetchAvailableMaterials() {
  try {
    const authToken = sessionStorage.getItem("authToken");
    const response = await fetch(`${baseURL}/material/material`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (Array.isArray(data)) {
      availableMaterials = data.map((m) => ({ name: m.Name }));
    } else {
      console.error("Unexpected format for materials:", data);
    }
  } catch (error) {
    console.error("Error fetching available materials:", error);
  }
}

// Fetch package details
async function fetchPackageDetails(packageID) {
  const apiUrl = `${baseURL}/api/packages/${packageID}`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    fillInTheFields(data);
    displayCustomizations(data.Customization);
    displayPackageResources(data.Resource);
  } catch (error) {
    console.error("Error fetching package details:", error);
    showMessage("An error occurred while fetching package details.", false);
  }
}

// Fetch assigned materials
async function fetchAssignedMaterials(packageID) {
  const apiUrl = `${baseURL}/material/package/${packageID}`;
  try {
    const authToken = sessionStorage.getItem("authToken");
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    if (!response.ok) {
      hasMaterials = false;
      return;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      hasMaterials = true;
      originalMaterials = data.map((m) => ({
        Name: m.Name,
        Percentage: m.Percentage,
      }));
      displayAssignedMaterials(originalMaterials);
    } else {
      hasMaterials = false;
    }
  } catch (error) {
    console.error("Error fetching assigned materials:", error);
    hasMaterials = false;
  }
}
