"use strict";

async function unassignCustomization(customizationId) {
  if (!confirm("Are you sure you want to unassign this customization?")) {
    return;
  }

  const payload = {
    customizationId: customizationId,
    packageIds: [parseInt(params)],
  };

  try {
    const authToken = sessionStorage.getItem("authToken");
    const response = await fetch(`${baseURL}/api/customization/package`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();

    const container = document.getElementById("customizationsAssignedContainer");
    const customizationElement = container.querySelector(
      `[data-customization-id="${customizationId}"]`
    );
    if (customizationElement) {
      customizationElement.remove();
    }

    showMessage(result.message || "Customization unassigned successfully!", true);
  } catch (error) {
    console.error("Error unassigning customization:", error);
    showMessage("Error unassigning customization. Please try again.", false);
  }
}

function displayCustomizations(customizations) {
  const container = document.getElementById("customizationsAssignedContainer");
  container.innerHTML = "";

  if (!customizations || customizations.length === 0) {
    container.innerHTML = '<p class="text-muted">No customizations assigned.</p>';
    return;
  }

  customizations.forEach((customization) => {
    const customizationItem = document.createElement("div");
    customizationItem.className = "customization-item";
    customizationItem.setAttribute(
      "data-customization-id",
      customization.CustomizationID
    );

    customizationItem.innerHTML = `
      <div>
          <strong>${customization.option.name} (${customization.option.type})</strong>
          <ul class="list-unstyled mb-0">
              ${customization.option.optionValues
                .map((value) => `<li>${value.name}${value.value ? `: ${value.value}` : ""}</li>`)
                .join("")}
          </ul>
      </div>
      <button class="remove-customization-btn" title="Unassign Customization">Remove</button>
    `;

    customizationItem
      .querySelector(".remove-customization-btn")
      .addEventListener("click", () => {
        unassignCustomization(customization.CustomizationID);
      });

    container.appendChild(customizationItem);
  });
}
