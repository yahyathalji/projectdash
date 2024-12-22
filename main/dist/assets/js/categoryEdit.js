function initializeDropify() {
    return new Promise((resolve, reject) => {
        try {
            // Initialize all Dropify elements
            $('.dropify').dropify();

            // Specific Dropify instance for the category image
            const drEvent = $('#dropify-event').dropify();

            // Confirmation before clearing the image
            drEvent.on('dropify.beforeClear', function (event, element) {
                return confirm(`Do you really want to delete "${element.file.name}"?`);
            });

            // Alert after the image is cleared
            drEvent.on('dropify.afterClear', function () {
                alert('File deleted');
            });

            // Initialize Dropify with French messages
            $('.dropify-fr').dropify({
                messages: {
                    default: 'Glissez-déposez un fichier ici ou cliquez',
                    replace: 'Glissez-déposez un fichier ou cliquez pour remplacer',
                    remove: 'Supprimer',
                    error: 'Désolé, le fichier est trop volumineux',
                },
            });

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

initializeDropify().then(() => {
    console.log("Dropify initialized successfully.");
}).catch(error => {
    console.error("Error initializing Dropify:", error);
});

function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Displays the list of subcategories in the specified container.
 * @param {Array} subCategories - Array of subcategory objects.
 * @param {HTMLElement} container - The DOM element to populate.
 */
function displaySubCategories(subCategories, container) {
    if (!container) {
        console.error("SubCategories container is null.");
        return;
    }

    container.innerHTML = ""; // Clear any existing content

    if (subCategories.length === 0) {
        container.innerHTML = "<p>No subcategories available.</p>";
        return;
    }

    subCategories.forEach(subCat => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        listItem.textContent = subCat.Name || "Unnamed SubCategory";

        // Status Badge
        const statusBadge = document.createElement("span");
        statusBadge.className = subCat.IsActive ? "badge bg-success" : "badge bg-secondary";
        statusBadge.textContent = subCat.IsActive ? "Active" : "Inactive";

        listItem.appendChild(statusBadge);
        container.appendChild(listItem);
    });
}
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await initializeDropify();
        console.log("Dropify initialized successfully.");
    } catch (error) {
        console.error("Error initializing Dropify:", error);
        return;
    }

    const params = getUserIdFromURL();

    if (!params) {
        alert("Category ID is missing!");
        return;
    }

    const apiUrl = `http://35.234.135.60:5000/api/category/${params}`;
    const categoryNameInput = document.getElementById("categoryName");
    const isActiveCheckbox = document.getElementById("isActive");
    const imageInput = $('#dropify-event'); // Use jQuery selector
    const saveButton = document.getElementById("saveButton"); // Updated to use ID
    const statusMessage = document.getElementById("statusMessage");
    const subCategoriesContainer = document.getElementById("subCategories"); // New container

    // Check if essential elements exist
    if (!categoryNameInput || !isActiveCheckbox || imageInput.length === 0 || !saveButton || !statusMessage || !subCategoriesContainer) {
        console.error("One or more required DOM elements are missing.");
        alert("A required form element is missing. Please check the console for details.");
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                // Note: Cookies are generally managed by the browser and don't need to be set manually in headers.
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data); 

        // Populate category name and status
        categoryNameInput.value = data.Name || "";
        isActiveCheckbox.checked = !!data.IsActive;

        // Handle image display
        if (data.Image && data.Image.filePath) {
            const fixedPath = data.Image.filePath.replace(/\\/g, "/");
            const imagePath = `http://35.234.135.60:5000/${fixedPath}`;
        
            const drEvent = imageInput.data('dropify'); // Get Dropify instance
            drEvent.settings.defaultFile = imagePath;
            drEvent.resetPreview();
            drEvent.clearElement();
            drEvent.settings.defaultFile = imagePath;
            drEvent.destroy();
            drEvent.init();
        } else {
            console.warn("No image filePath found in data.");
        }

        // Handle SubCategories display
        if (data.SubCategory && Array.isArray(data.SubCategory)) {
            displaySubCategories(data.SubCategory, subCategoriesContainer);
        } else {
            console.warn("No subcategories found in data.");
            subCategoriesContainer.innerHTML = "<p>No subcategories available.</p>";
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        if (statusMessage) { // Additional check
            statusMessage.textContent = `Error fetching data: ${error.message}`;
            statusMessage.style.color = "red";
        }
    }

    // Handle Save Button Click
    saveButton.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!statusMessage) {
            console.error("Status message element is missing.");
            return;
        }

        statusMessage.textContent = "";

        const categoryName = categoryNameInput.value.trim();
        const isActive = isActiveCheckbox.checked;
        const imageFile = imageInput[0].files[0]; // Access the DOM element

        if (!categoryName) {
            statusMessage.textContent = "Category name is required!";
            statusMessage.style.color = "red";
            return;
        }

        const formData = new FormData();
        formData.append("Name", categoryName);
        formData.append("IsActive", isActive);
        if (imageFile) {
            formData.append("file", imageFile);
        }

        try {
            const updateResponse = await fetch(`http://35.234.135.60:5000/api/category/${params}`, {
                method: "PUT",
                body: formData,
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                    // Note: When sending FormData, 'Content-Type' should not be set manually.
                },
            });

            if (updateResponse.ok) {
                statusMessage.textContent = "Category updated successfully!";
                statusMessage.style.color = "green";

                // Optionally, refresh the page or update the UI with new data
                // location.reload();
            } else {
                const errorDetails = await updateResponse.json();
                statusMessage.textContent = `Failed to update category. Error: ${errorDetails.message || "Unknown error"}`;
                statusMessage.style.color = "red";
            }
        } catch (error) {
            console.error("Error updating category:", error);
            statusMessage.textContent = `An error occurred while updating the category. Error: ${error.message}`;
            statusMessage.style.color = "red";
        }
    });
});
