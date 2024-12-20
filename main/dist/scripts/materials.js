"use strict";

function createMaterialItem() {
  const materialItem = document.createElement("div");
  materialItem.className = "material-item row";

  const materialOptions = availableMaterials
    .map((material) => `<option value="${material.name}">${material.name}</option>`)
    .join("");

  materialItem.innerHTML = `
    <div class="col-md-5">
      <label class="form-label">Material</label>
      <select class="form-select material-select" required>
        <option value="">Select Material</option>
        ${materialOptions}
      </select>
    </div>
    <div class="col-md-5">
      <label class="form-label">Percentage</label>
      <input type="number" class="form-control material-percentage" placeholder="Enter Percentage" min="0" max="100" required>
    </div>
    <div class="col-md-2 d-flex align-items-end">
      <button type="button" class="btn btn-danger remove-material-btn">Remove</button>
    </div>
  `;
  return materialItem;
}

function displayAssignedMaterials(materials) {
  const materialsContainer = document.getElementById("materialsContainer");
  materialsContainer.innerHTML = "";

  materials.forEach((m) => {
    const materialItem = createMaterialItem();
    const materialSelect = materialItem.querySelector(".material-select");
    const percentageInput = materialItem.querySelector(".material-percentage");

    const materialOption = Array.from(materialSelect.options).find(
      (option) => option.value === m.Name
    );
    if (materialOption) {
      materialSelect.value = materialOption.value;
    }

    percentageInput.value = m.Percentage;
    materialsContainer.appendChild(materialItem);
  });
}

function initializeMaterialsButtons() {
  const addMaterialBtn = document.getElementById("addMaterialBtn");
  const updateMaterialsBtn = document.getElementById("updateMaterialsBtn");
  const materialsContainer = document.getElementById("materialsContainer");

  addMaterialBtn.addEventListener("click", function () {
    materialsContainer.appendChild(createMaterialItem());
  });

  materialsContainer.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("remove-material-btn")) {
      const item = e.target.closest(".material-item");
      const materialSelect = item.querySelector(".material-select");
      const selectedMaterialName = materialSelect.value;

      const orig = originalMaterials.find((mat) => mat.Name === selectedMaterialName);
      if (orig) {
        materialsToDelete.push(orig.Name);
      }

      item.remove();
    }
  });

  updateMaterialsBtn.addEventListener("click", updateMaterials);
}

async function updateMaterials() {
  const materialItems = document.querySelectorAll(".material-item");
  const newMaterials = [];
  let totalPercentage = 0;
  let valid = true;
  const selectedMaterialNames = new Set();

  materialItems.forEach((item) => {
    const materialSelect = item.querySelector(".material-select");
    const materialName = materialSelect.value.trim();
    const percentage = parseInt(
      item.querySelector(".material-percentage").value,
      10
    );

    if (!materialName || isNaN(percentage) || percentage < 0 || percentage > 100) {
      valid = false;
      return;
    }

    if (selectedMaterialNames.has(materialName)) {
      valid = false;
      return;
    }

    selectedMaterialNames.add(materialName);
    totalPercentage += percentage;
    newMaterials.push({ name: materialName, percentage });
  });

  if (!valid) {
    alert("Please ensure all materials are valid, unique, and within 0-100%.");
    return;
  }

  if (totalPercentage !== 100) {
    alert("Total percentage must equal 100%. Currently, it is " + totalPercentage + "%.");
    return;
  }

  const authToken = sessionStorage.getItem("authToken");

  if (hasMaterials) {
    // Update existing materials
    try {
      const updateResponse = await fetch(`${baseURL}/material/package/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          PackageID: parseInt(params),
          Materials: newMaterials,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || `Server error: ${updateResponse.status}`);
      }

      const updateData = await updateResponse.json();

      if (updateData.success) {
        showMessage(updateData.message || "Materials updated successfully!", true);
        originalMaterials = newMaterials.map((m) => ({
          Name: m.name,
          Percentage: m.percentage,
        }));
        materialsToDelete = [];
      } else {
        showMessage(updateData.message || "Failed to update materials.", false);
      }
    } catch (error) {
      console.error("Error updating materials:", error);
      showMessage("Error updating materials. Please try again.", false);
    }

    // Handle deletion
    if (materialsToDelete.length > 0) {
      try {
        const deleteResponse = await fetch(`${baseURL}/material/package/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            PackageID: parseInt(params),
            MaterialNames: materialsToDelete,
          }),
        });

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.message || `Server error: ${deleteResponse.status}`);
        }

        const deleteData = await deleteResponse.json();

        if (deleteData.success) {
          showMessage(deleteData.message || "Materials removed successfully!", true);
          originalMaterials = originalMaterials.filter((m) => !materialsToDelete.includes(m.Name));
          materialsToDelete = [];
        } else {
          showMessage(deleteData.message || "Failed to remove materials.", false);
        }
      } catch (error) {
        console.error("Error deleting materials:", error);
        showMessage("Error deleting materials. Please try again.", false);
      }
    }
  } else {
    // Assign new materials
    try {
      const assignResponse = await fetch(`${baseURL}/material/package`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          PackageID: parseInt(params),
          Materials: newMaterials,
        }),
      });

      if (!assignResponse.ok) {
        const errorData = await assignResponse.json();
        throw new Error(errorData.message || `Server error: ${assignResponse.status}`);
      }

      const assignData = await assignResponse.json();

      if (assignData.success) {
        showMessage(assignData.message || "Materials assigned successfully!", true);
        originalMaterials = newMaterials.map((m) => ({
          Name: m.name,
          Percentage: m.percentage,
        }));
        hasMaterials = true;
        materialsToDelete = [];
      } else {
        showMessage(assignData.message || "Failed to assign materials.", false);
      }
    } catch (error) {
      console.error("Error assigning materials:", error);
      showMessage("Error assigning materials. Please try again.", false);
    }
  }
}
