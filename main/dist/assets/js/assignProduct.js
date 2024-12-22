// assignProduct.js

document.addEventListener("DOMContentLoaded", function () {
    const customizationsApiEndpoint = "http://35.234.135.60:5000/api/customization"; // API Endpoint to fetch customizations
    const assignApiEndpoint = "http://35.234.135.60:5000/api/customization/product"; // API Endpoint to assign customization to products
    const productsApiEndpoint = "http://35.234.135.60:5000/api/getAllproducts"; // API Endpoint to fetch products

    // DOM Elements for Customizations
    const customizationsTableBody = document.querySelector("#customizationsTable tbody");
    const loadingSpinnerCustomizations = document.getElementById("loadingSpinnerCustomizations");
    const noDataCustomizations = document.getElementById("noDataCustomizations");

    // DOM Elements for Products
    const productsTableBody = document.querySelector("#productsTable tbody");
    const loadingSpinnerProducts = document.getElementById("loadingSpinnerProducts");
    const noDataProducts = document.getElementById("noDataProducts");

    // Assign Button
    const assignBtn = document.getElementById("assignBtn");

    // Feedback Container
    const feedbackContainer = document.getElementById("feedbackContainer");

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
            loadingSpinnerCustomizations.style.display = "flex";
            customizationsTableBody.innerHTML = '';
            noDataCustomizations.style.display = "none";

            const response = await fetch(customizationsApiEndpoint, {
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
            loadingSpinnerCustomizations.style.display = "none";

            if (Array.isArray(data) && data.length > 0) {
                populateCustomizationsTable(data);
            } else {
                noDataCustomizations.style.display = "block";
            }
        } catch (error) {
            // Hide loading spinner
            loadingSpinnerCustomizations.style.display = "none";
            showFeedback(error.message, 'danger');
            console.error(error);
        }
    }

    // ------------------------
    // Fetch Products Data
    // ------------------------
    async function fetchProducts() {
        try {
            // Show loading spinner and hide table and messages
            loadingSpinnerProducts.style.display = "flex";
            productsTableBody.innerHTML = '';
            noDataProducts.style.display = "none";

            const response = await fetch(productsApiEndpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("authToken")}` // Include if required
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching products: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Hide loading spinner
            loadingSpinnerProducts.style.display = "none";

            if (Array.isArray(data) && data.length > 0) {
                populateProductsTable(data);
            } else {
                noDataProducts.style.display = "block";
            }
        } catch (error) {
            // Hide loading spinner
            loadingSpinnerProducts.style.display = "none";
            showFeedback(error.message, 'danger');
            console.error(error);
        }
    }

    // ------------------------
    // Populate Customizations Table
    // ------------------------
    function populateCustomizationsTable(customizations) {
        customizationsTableBody.innerHTML = ''; // Clear existing data

        customizations.forEach(customization => {
            const tr = document.createElement('tr');

            // Select Radio Button
            const tdSelect = document.createElement('td');
            tdSelect.innerHTML = `
                <input type="radio" name="selectedCustomization" value="${customization.CustomizationID}">
            `;
            tr.appendChild(tdSelect);

            // Customization ID
            const tdID = document.createElement('td');
            tdID.textContent = customization.CustomizationID || 'N/A';
            tr.appendChild(tdID);

            // Name
            const tdName = document.createElement('td');
            tdName.textContent = customization.option && customization.option.name ? customization.option.name : 'N/A';
            tr.appendChild(tdName);

            // Type
            const tdType = document.createElement('td');
            tdType.textContent = customization.option && customization.option.type ? customization.option.type : 'N/A';
            tr.appendChild(tdType);

            // Option Values
            const tdOptions = document.createElement('td');
            if (customization.option && Array.isArray(customization.option.optionValues) && customization.option.optionValues.length > 0) {
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

            // Append the row to the table body
            customizationsTableBody.appendChild(tr);
        });

        // Initialize DataTables after populating the table
        $('#customizationsTable').DataTable({
            responsive: true,
            destroy: true,
            columnDefs: [
                { targets: [0], orderable: false },
                { targets: [-1, -3], className: 'dt-body-right' }
            ]
        });
    }

    // ------------------------
    // Populate Products Table
    // ------------------------
    function populateProductsTable(products) {
        productsTableBody.innerHTML = ''; // Clear existing data

        products.forEach(product => {
            const tr = document.createElement('tr');

            // Select Checkbox
            const tdSelect = document.createElement('td');
            tdSelect.innerHTML = `
                <input type="checkbox" name="selectedProducts" value="${product.ProductID}">
            `;
            tr.appendChild(tdSelect);

            // Product ID
            const tdID = document.createElement('td');
            tdID.textContent = product.ProductID || 'N/A';
            tr.appendChild(tdID);

            // Name
            const tdName = document.createElement('td');
            tdName.textContent = product.Name || 'N/A';
            tr.appendChild(tdName);

            // Description
            const tdDescription = document.createElement('td');
            tdDescription.textContent = product.Description || 'N/A';
            tr.appendChild(tdDescription);

            // Price
            const tdPrice = document.createElement('td');
            tdPrice.textContent = product.Price || 'N/A';
            tr.appendChild(tdPrice);

            // Quantity
            const tdQuantity = document.createElement('td');
            tdQuantity.textContent = product.Quantity || 'N/A';
            tr.appendChild(tdQuantity);

            // Status
            const tdStatus = document.createElement('td');
            tdStatus.textContent = product.Status || 'N/A';
            tr.appendChild(tdStatus);

            // Material
            const tdMaterial = document.createElement('td');
            tdMaterial.textContent = product.Material || 'N/A';
            tr.appendChild(tdMaterial);

            // Avg Rating
            const tdAvgRating = document.createElement('td');
            tdAvgRating.textContent = product.AvgRating || 'N/A';
            tr.appendChild(tdAvgRating);

            // Created At
            const tdCreatedAt = document.createElement('td');
            const createdAt = product.CreatedAt ? new Date(product.CreatedAt).toLocaleString() : 'N/A';
            tdCreatedAt.textContent = createdAt;
            tr.appendChild(tdCreatedAt);

            // Updated At
            const tdUpdatedAt = document.createElement('td');
            const updatedAt = product.UpdatedAt ? new Date(product.UpdatedAt).toLocaleString() : 'N/A';
            tdUpdatedAt.textContent = updatedAt;
            tr.appendChild(tdUpdatedAt);

            // Append the row to the table body
            productsTableBody.appendChild(tr);
        });

        // Initialize DataTables after populating the table
        $('#productsTable').DataTable({
            responsive: true,
            destroy: true,
            columnDefs: [
                { targets: [0], orderable: false },
                { targets: [-1, -3], className: 'dt-body-right' }
            ]
        });
    }

    // ------------------------
    // Assign Button Click Handler
    // ------------------------
    assignBtn.addEventListener('click', async function () {
        // Get selected customization ID (radio button)
        const selectedCustomizationRadio = document.querySelector('input[name="selectedCustomization"]:checked');
        if (!selectedCustomizationRadio) {
            showFeedback('Please select a customization to assign.', 'warning');
            return;
        }
        const customizationId = parseInt(selectedCustomizationRadio.value);

        // Get selected product IDs (checkboxes)
        const selectedProductCheckboxes = document.querySelectorAll('input[name="selectedProducts"]:checked');
        if (selectedProductCheckboxes.length === 0) {
            showFeedback('Please select at least one product to assign the customization.', 'warning');
            return;
        }
        const productIds = Array.from(selectedProductCheckboxes).map(cb => parseInt(cb.value));

        // Prepare the request body
        const requestBody = {
            customizationId: customizationId,
            productIds: productIds
        };

        try {
            // Disable Assign button to prevent multiple clicks
            assignBtn.disabled = true;
            assignBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Assigning...`;

            const response = await fetch(assignApiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("authToken")}` // Include if required
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                // Attempt to parse error message from response
                let errorMessage = `Error assigning customization: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (_) {
                    // Ignore JSON parsing errors
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Re-enable Assign button
            assignBtn.disabled = false;
            assignBtn.innerHTML = `<i class="fa fa-check me-2"></i> Assign Customization to Products`;

            showFeedback(`Customization ID ${customizationId} has been successfully assigned to ${productIds.length} product(s).`, 'success');

            // Optionally, clear selections
            document.querySelectorAll('input[name="selectedCustomization"]').forEach(radio => radio.checked = false);
            document.querySelectorAll('input[name="selectedProducts"]').forEach(checkbox => checkbox.checked = false);

        } catch (error) {
            // Re-enable Assign button
            assignBtn.disabled = false;
            assignBtn.innerHTML = `<i class="fa fa-check me-2"></i> Assign Customization to Products`;

            showFeedback(error.message, 'danger');
            console.error(error);
        }
    });

    // ------------------------
    // Initial Fetch on Page Load
    // ------------------------
    fetchCustomizations();
    fetchProducts();
});
