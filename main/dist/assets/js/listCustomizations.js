// listCustomizations.js

document.addEventListener("DOMContentLoaded", function () {
    const apiEndpoint = "http://localhost:5000/api/customization"; // API Endpoint
    const customizationsTableBody = document.querySelector("#customizationsTable tbody");
    const feedbackContainer = document.getElementById("feedbackContainer");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const noDataMessage = document.getElementById("noDataMessage");
    const refreshBtn = document.getElementById("refreshBtn");

    // ------------------------
    // Feedback Function
    // ------------------------
    function showFeedback(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        feedbackContainer.appendChild(alertDiv);

        // Automatically remove the alert after 5 seconds
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            alert.close();
        }, 5000);
    }

    // ------------------------
    // Fetch Customizations Data
    // ------------------------
    async function fetchCustomizations() {
        try {
            // Show loading spinner and hide table and messages
            loadingSpinner.style.display = "flex";
            customizationsTableBody.innerHTML = '';
            noDataMessage.style.display = "none";

            const response = await fetch(apiEndpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("authToken")}` // Include if required
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching customizations: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Hide loading spinner
            loadingSpinner.style.display = "none";

            if (Array.isArray(data) && data.length > 0) {
                populateTable(data);
            } else {
                noDataMessage.style.display = "block";
            }
        } catch (error) {
            // Hide loading spinner
            loadingSpinner.style.display = "none";
            showFeedback(error.message, 'danger');
            console.error(error);
        }
    }

    // ------------------------
    // Populate Table with Data
    // ------------------------
    function populateTable(customizations) {
        customizationsTableBody.innerHTML = ''; // Clear existing data

        customizations.forEach(customization => {
            const tr = document.createElement('tr');

            // Customization ID
            const tdID = document.createElement('td');
            tdID.textContent = customization.CustomizationID || 'N/A';
            tr.appendChild(tdID);

            // Name
            const tdName = document.createElement('td');
            tdName.textContent = customization.option.name || 'N/A';
            tr.appendChild(tdName);

            // Type
            const tdType = document.createElement('td');
            tdType.textContent = customization.option.type || 'N/A';
            tr.appendChild(tdType);

            // Option Values
            const tdOptions = document.createElement('td');
            if (Array.isArray(customization.option.optionValues) && customization.option.optionValues.length > 0) {
                const ul = document.createElement('ul');
                customization.option.optionValues.forEach(optionValue => {
                    const li = document.createElement('li');
                    li.textContent = `Name: ${optionValue.name || 'N/A'}, Value: ${optionValue.value || 'N/A'}, File: ${optionValue.fileName || 'N/A'}`;
                    ul.appendChild(li);
                });
                tdOptions.appendChild(ul);
            } else {
                tdOptions.textContent = 'N/A';
            }
            tr.appendChild(tdOptions);

            // Created At
            const tdCreatedAt = document.createElement('td');
            const createdAt = customization.CreatedAt ? new Date(customization.CreatedAt).toLocaleString() : 'N/A';
            tdCreatedAt.textContent = createdAt;
            tr.appendChild(tdCreatedAt);

            // Updated At
            const tdUpdatedAt = document.createElement('td');
            const updatedAt = customization.UpdatedAt ? new Date(customization.UpdatedAt).toLocaleString() : 'N/A';
            tdUpdatedAt.textContent = updatedAt;
            tr.appendChild(tdUpdatedAt);

            // Actions (View, Edit, Delete)
            const tdActions = document.createElement('td');
            tdActions.innerHTML = `
                <button class="btn btn-info btn-sm action-btn view-btn" title="View Details">
                    <i class="fa fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm action-btn edit-btn" title="Edit Customization">
                    <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm action-btn delete-btn" title="Delete Customization">
                    <i class="fa fa-trash"></i>
                </button>
            `;
            tr.appendChild(tdActions);

            // Append the row to the table body
            customizationsTableBody.appendChild(tr);

            // Add Event Listeners for Action Buttons
            tr.querySelector('.view-btn').addEventListener('click', function () {
                viewCustomization(customization.CustomizationID);
            });

            tr.querySelector('.edit-btn').addEventListener('click', function () {
                editCustomization(customization.CustomizationID);
            });

            tr.querySelector('.delete-btn').addEventListener('click', function () {
                deleteCustomization(customization.CustomizationID);
            });
        });
    }

    // ------------------------
    // Handle Refresh Button Click
    // ------------------------
    refreshBtn.addEventListener('click', function () {
        fetchCustomizations();
    });

    // ------------------------
    // View Customization Function
    // ------------------------
    function viewCustomization(customizationID) {
        // Implement the logic to view customization details
        // For example, redirect to a details page or open a modal
        // Example: window.location.href = `view-customization.html?id=${customizationID}`;
        showFeedback(`View details for Customization ID: ${customizationID}`, 'info');
    }

    // ------------------------
    // Edit Customization Function
    // ------------------------
    function editCustomization(customizationID) {
        // Implement the logic to edit the customization
        // For example, redirect to an edit form page
         window.location.href = `Edit-customization.html?id=${customizationID}`;
        showFeedback(`Edit Customization ID: ${customizationID}`, 'warning');
    }

    // ------------------------
    // Delete Customization Function
    // ------------------------
    async function deleteCustomization(customizationID) {
        if (!confirm(`Are you sure you want to delete Customization ID: ${customizationID}?`)) {
            return;
        }

        try {
            const response = await fetch(`${apiEndpoint}/${customizationID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("authToken")}` // Include if required
                }
            });

            if (!response.ok) {
                throw new Error(`Error deleting customization: ${response.status} ${response.statusText}`);
            }

            showFeedback(`Customization ID: ${customizationID} has been deleted successfully.`, 'success');
            fetchCustomizations(); // Refresh the list
        } catch (error) {
            showFeedback(error.message, 'danger');
            console.error(error);
        }
    }

    // ------------------------
    // Initial Fetch on Page Load
    // ------------------------
    fetchCustomizations();
});
