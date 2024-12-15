// assets/js/orderDetails.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const orderSelect = document.getElementById('orderSelect');
    const orderTitle = document.getElementById('orderTitle');
    const orderCreatedAt = document.getElementById('OrderCreatedAt');
    const customerName = document.getElementById('customerName');
    const userEmail = document.getElementById('userEmail');
    const phoneNumber = document.getElementById('PhoneNumber');
    const addressLine = document.getElementById('AddressLine');
    const postalCode = document.getElementById('PostalCode');
    const city = document.getElementById('City');
    const state = document.getElementById('State');
    const country = document.getElementById('Country');
    const phone = document.getElementById('Phone');
    const cartTableBody = document.getElementById('cartTableBody');
    const totalPayable = document.getElementById('totalPayable');
    const statusForm = document.getElementById('statusForm');
    const statusSelect = document.getElementById('statusSelect');

    // Function to extract the first image from resources
    function extractFirstImage(resources) {
        if (!resources || !Array.isArray(resources)) return null;
        return resources.find(resource => resource.fileType && resource.fileType.startsWith("image/")) || null;
    }

    // Function to get OrderID from URL
    function getOrderIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('orderId');
    }

    // Function to fetch all orders for the dropdown
    async function fetchOrders() {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
            alert("Authentication token not found. Please log in first.");
            window.location.href = '/login.html'; // Redirect to login page
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/orders/admin', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
            }

            const orders = await response.json();
            populateOrderDropdown(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Failed to fetch orders. Please try again later.');
        }
    }

    // Function to populate the order dropdown
    function populateOrderDropdown(orders) {
        // Clear existing options except the first
        orderSelect.innerHTML = '<option disabled selected>Select Order</option>';

        orders.forEach(order => {
            const option = document.createElement("option");
            option.value = order.OrderID;
            option.textContent = `Order #${order.OrderID} - ${capitalizeFirstLetter(order.Status)}`;
            orderSelect.appendChild(option);
        });

        // If there's an OrderID in the URL, select it
        const orderIdFromURL = getOrderIdFromURL();
        if (orderIdFromURL) {
            orderSelect.value = orderIdFromURL;
            fetchOrderDetails(orderIdFromURL);
        }
    }

    // Function to capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Function to fetch order details by OrderID
    async function fetchOrderDetails(orderId) {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
            alert("Authentication token not found. Please log in first.");
            window.location.href = '/login.html'; // Redirect to login page
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch order details: ${response.status} ${response.statusText}`);
            }

            const order = await response.json();
            displayOrderDetails(order);
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Failed to fetch order details. Please try again later.');
        }
    }

    // Function to display order details in the HTML
    function displayOrderDetails(order) {
        // Update Order Title
        orderTitle.textContent = `Order Details: #${order.OrderID}`;

        // Update Order Information
        const createdAt = new Date(order.CreatedAt);
        orderCreatedAt.textContent = createdAt.toLocaleDateString();

        customerName.textContent = order.User.Username;
        userEmail.textContent = order.User.Email;
        phoneNumber.textContent = order.User.PhoneNumber;

        addressLine.textContent = order.Address.AddressLine;
        postalCode.textContent = order.Address.PostalCode;
        city.textContent = order.Address.City;
        state.textContent = order.Address.State;
        country.textContent = order.Address.Country;
        phone.textContent = order.User.PhoneNumber;

        totalPayable.textContent = `$${parseFloat(order.TotalPrice).toFixed(2)}`;

        // Populate Order Summary Table
        cartTableBody.innerHTML = ''; // Clear existing rows

        // Handle OrdersProducts
        order.OrdersProducts.forEach(product => {
            const row = document.createElement('tr');

            // Item Image
            const imgCell = document.createElement('td');
            const firstImage = extractFirstImage(product.Product.Resource);
            if (firstImage) {
                const imagePath = `http://localhost:5000/${firstImage.filePath.replace(/\\/g, '/')}`;
                imgCell.innerHTML = `<img src="${imagePath}" class="avatar rounded lg" style="width: 100px; height: auto;" alt="${product.Product.Name}">`;
            } else {
                imgCell.textContent = "No image available";
            }
            row.appendChild(imgCell);

            // Item Name
            const nameCell = document.createElement('td');
            nameCell.innerHTML = `<h6 class="title">${product.Product.Name}</h6>`;
            row.appendChild(nameCell);

            // Quantity
            const quantityCell = document.createElement('td');
            quantityCell.textContent = product.Quantity;
            row.appendChild(quantityCell);

            // Price
            const priceCell = document.createElement('td');
            priceCell.innerHTML = `<p class="price">$${parseFloat(product.TotalPrice).toFixed(2)}</p>`;
            row.appendChild(priceCell);

            cartTableBody.appendChild(row);

            // Handle Ordered Customization if available
            if (product.OrderedCustomization && product.OrderedCustomization.option && Array.isArray(product.OrderedCustomization.option.optionValues)) {
                const customizationRow = document.createElement('tr');
                const customizationCell = document.createElement('td');
                customizationCell.colSpan = 4; // Span across all columns

                // Build Customization Details
                let customizationHTML = '<div style="margin-left: 20px;"><strong>Customizations:</strong><br>';
                const customization = product.OrderedCustomization;

                customization.option.optionValues.forEach(value => {
                    customizationHTML += `<strong>${capitalizeFirstLetter(value.name)}:</strong> ${value.value || 'N/A'}<br>`;
                    if (value.fileName) {
                        const resourcePath = `http://localhost:5000/resources/${value.fileName}`;
                        customizationHTML += `<img src="${resourcePath}" style="max-width:100px; max-height:100px;" alt="${value.name}"><br>`;
                    }
                });

                customizationHTML += '</div>';
                customizationCell.innerHTML = customizationHTML;
                customizationRow.appendChild(customizationCell);
                cartTableBody.appendChild(customizationRow);
            }
        });

        // Handle OrdersPackages if any
        if (order.OrdersPackages && order.OrdersPackages.length > 0) {
            order.OrdersPackages.forEach(pkg => {
                const row = document.createElement('tr');

                // Package Image
                const imgCell = document.createElement('td');
                const firstImage = extractFirstImage(pkg.Package.Resource);
                if (firstImage) {
                    const imagePath = `http://localhost:5000/${firstImage.filePath.replace(/\\/g, '/')}`;
                    imgCell.innerHTML = `<img src="${imagePath}" class="avatar rounded lg" style="width: 100px; height: auto;" alt="${pkg.Package.Name}">`;
                } else {
                    imgCell.textContent = "No image available";
                }
                row.appendChild(imgCell);

                // Package Name
                const nameCell = document.createElement('td');
                nameCell.innerHTML = `<h6 class="title">${pkg.Package.Name}</h6>`;
                row.appendChild(nameCell);

                // Quantity
                const quantityCell = document.createElement('td');
                quantityCell.textContent = pkg.quantity;
                row.appendChild(quantityCell);

                // Price
                const priceCell = document.createElement('td');
                priceCell.innerHTML = `<p class="price">$${parseFloat(pkg.TotalPrice).toFixed(2)}</p>`;
                row.appendChild(priceCell);

                cartTableBody.appendChild(row);

                // Handle Package Customization if available
                if (pkg.OrderedCustomization && pkg.OrderedCustomization.option && Array.isArray(pkg.OrderedCustomization.option.optionValues)) {
                    const customizationRow = document.createElement('tr');
                    const customizationCell = document.createElement('td');
                    customizationCell.colSpan = 4; // Span across all columns

                    // Build Customization Details
                    let customizationHTML = '<div style="margin-left: 20px;"><strong>Package Customizations:</strong><br>';
                    const customization = pkg.OrderedCustomization;

                    customization.option.optionValues.forEach(value => {
                        customizationHTML += `<strong>${capitalizeFirstLetter(value.name)}:</strong> ${value.value || 'N/A'}<br>`;
                        if (value.fileName) {
                            const resourcePath = `http://localhost:5000/resources/${value.fileName}`;
                            customizationHTML += `<img src="${resourcePath}" style="max-width:100px; max-height:100px;" alt="${value.name}"><br>`;
                        }
                    });

                    customizationHTML += '</div>';
                    customizationCell.innerHTML = customizationHTML;
                    customizationRow.appendChild(customizationCell);
                    cartTableBody.appendChild(customizationRow);
                }
            });
        }
    }

    // Function to update order status
    async function updateOrderStatus(orderId, newStatus) {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
            alert("Authentication token not found. Please log in first.");
            window.location.href = '/login.html'; // Redirect to login page
            return;
        }

        let endpoint = `http://localhost:5000/api/orders/${orderId}`;
        let method = 'PATCH';
        let body = JSON.stringify({ Status: newStatus });

        // Special handling for 'approved' and 'rejected' statuses
        if (newStatus === 'approved') {
            endpoint = `http://localhost:5000/api/orders/${orderId}/approve`;
            method = 'POST';
            body = null;
        } else if (newStatus === 'rejected') {
            endpoint = `http://localhost:5000/api/orders/${orderId}/reject`;
            method = 'POST';
            body = null;
        }

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error(`Failed to update status: ${response.status} ${response.statusText}`);
            }

            const updatedOrder = await response.json();
            alert('Order status updated successfully!');
            // Optionally, refresh the order details
            fetchOrderDetails(orderId);
            // Update the order select dropdown to reflect the new status
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        }
    }

    // Function to capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Function to fetch order details by OrderID (defined globally to be accessible inside updateOrderStatus)
    async function fetchOrderDetails(orderId) {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
            alert("Authentication token not found. Please log in first.");
            window.location.href = '/login.html'; // Redirect to login page
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch order details: ${response.status} ${response.statusText}`);
            }

            const order = await response.json();
            displayOrderDetails(order);
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Failed to fetch order details. Please try again later.');
        }
    }

    // Function to display order details in the HTML (redefined here to be accessible globally)
    function displayOrderDetails(order) {
        // Update Order Title
        orderTitle.textContent = `Order Details: #${order.OrderID}`;

        // Update Order Information
        const createdAt = new Date(order.CreatedAt);
        orderCreatedAt.textContent = createdAt.toLocaleDateString();

        customerName.textContent = order.User.Username;
        userEmail.textContent = order.User.Email;
        phoneNumber.textContent = order.User.PhoneNumber;

        addressLine.textContent = order.Address.AddressLine;
        postalCode.textContent = order.Address.PostalCode;
        city.textContent = order.Address.City;
        state.textContent = order.Address.State;
        country.textContent = order.Address.Country;
        phone.textContent = order.User.PhoneNumber;

        totalPayable.textContent = `$${parseFloat(order.TotalPrice).toFixed(2)}`;

        // Populate Order Summary Table
        cartTableBody.innerHTML = ''; // Clear existing rows

        // Handle OrdersProducts
        order.OrdersProducts.forEach(product => {
            const row = document.createElement('tr');

            // Item Image
            const imgCell = document.createElement('td');
            const firstImage = extractFirstImage(product.Product.Resource);
            if (firstImage) {
                const imagePath = `http://localhost:5000/${firstImage.filePath.replace(/\\/g, '/')}`;
                imgCell.innerHTML = `<img src="${imagePath}" class="avatar rounded lg" style="width: 100px; height: auto;" alt="${product.Product.Name}">`;
            } else {
                imgCell.textContent = "No image available";
            }
            row.appendChild(imgCell);

            // Item Name
            const nameCell = document.createElement('td');
            nameCell.innerHTML = `<h6 class="title">${product.Product.Name}</h6>`;
            row.appendChild(nameCell);

            // Quantity
            const quantityCell = document.createElement('td');
            quantityCell.textContent = product.Quantity;
            row.appendChild(quantityCell);

            // Price
            const priceCell = document.createElement('td');
            priceCell.innerHTML = `<p class="price">$${parseFloat(product.TotalPrice).toFixed(2)}</p>`;
            row.appendChild(priceCell);

            cartTableBody.appendChild(row);

            // Handle Ordered Customization if available
            if (product.OrderedCustomization && product.OrderedCustomization.option && Array.isArray(product.OrderedCustomization.option.optionValues)) {
                const customizationRow = document.createElement('tr');
                const customizationCell = document.createElement('td');
                customizationCell.colSpan = 4; // Span across all columns

                // Build Customization Details
                let customizationHTML = '<div style="margin-left: 20px;"><strong>Customizations:</strong><br>';
                const customization = product.OrderedCustomization;

                customization.option.optionValues.forEach(value => {
                    customizationHTML += `<strong>${capitalizeFirstLetter(value.name)}:</strong> ${value.value || 'N/A'}<br>`;
                    if (value.fileName) {
                        const resourcePath = `http://localhost:5000/resources/${value.fileName}`;
                        customizationHTML += `<img src="${resourcePath}" style="max-width:100px; max-height:100px;" alt="${value.name}"><br>`;
                    }
                });

                customizationHTML += '</div>';
                customizationCell.innerHTML = customizationHTML;
                customizationRow.appendChild(customizationCell);
                cartTableBody.appendChild(customizationRow);
            }
        });

        // Handle OrdersPackages if any
        if (order.OrdersPackages && order.OrdersPackages.length > 0) {
            order.OrdersPackages.forEach(pkg => {
                const row = document.createElement('tr');

                // Package Image
                const imgCell = document.createElement('td');
                const firstImage = extractFirstImage(pkg.Package.Resource);
                if (firstImage) {
                    const imagePath = `http://localhost:5000/${firstImage.filePath.replace(/\\/g, '/')}`;
                    imgCell.innerHTML = `<img src="${imagePath}" class="avatar rounded lg" style="width: 100px; height: auto;" alt="${pkg.Package.Name}">`;
                } else {
                    imgCell.textContent = "No image available";
                }
                row.appendChild(imgCell);

                // Package Name
                const nameCell = document.createElement('td');
                nameCell.innerHTML = `<h6 class="title">${pkg.Package.Name}</h6>`;
                row.appendChild(nameCell);

                // Quantity
                const quantityCell = document.createElement('td');
                quantityCell.textContent = pkg.quantity;
                row.appendChild(quantityCell);

                // Price
                const priceCell = document.createElement('td');
                priceCell.innerHTML = `<p class="price">$${parseFloat(pkg.TotalPrice).toFixed(2)}</p>`;
                row.appendChild(priceCell);

                cartTableBody.appendChild(row);

                // Handle Package Customization if available
                if (pkg.OrderedCustomization && pkg.OrderedCustomization.option && Array.isArray(pkg.OrderedCustomization.option.optionValues)) {
                    const customizationRow = document.createElement('tr');
                    const customizationCell = document.createElement('td');
                    customizationCell.colSpan = 4; // Span across all columns

                    // Build Customization Details
                    let customizationHTML = '<div style="margin-left: 20px;"><strong>Package Customizations:</strong><br>';
                    const customization = pkg.OrderedCustomization;

                    customization.option.optionValues.forEach(value => {
                        customizationHTML += `<strong>${capitalizeFirstLetter(value.name)}:</strong> ${value.value || 'N/A'}<br>`;
                        if (value.fileName) {
                            const resourcePath = `http://localhost:5000/resources/${value.fileName}`;
                            customizationHTML += `<img src="${resourcePath}" style="max-width:100px; max-height:100px;" alt="${value.name}"><br>`;
                        }
                    });

                    customizationHTML += '</div>';
                    customizationCell.innerHTML = customizationHTML;
                    customizationRow.appendChild(customizationCell);
                    cartTableBody.appendChild(customizationRow);
                }
            });
        }
    }

    // Function to update order status
    async function updateOrderStatus(orderId, newStatus) {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
            alert("Authentication token not found. Please log in first.");
            window.location.href = '/login.html'; // Redirect to login page
            return;
        }

        let endpoint = `http://localhost:5000/api/orders/${orderId}`;
        let method = 'PATCH';
        let body = JSON.stringify({ Status: newStatus });

        // Special handling for 'approved' and 'rejected' statuses
        if (newStatus === 'approved') {
            endpoint = `http://localhost:5000/api/orders/${orderId}/approve`;
            method = 'POST';
            body = null;
        } else if (newStatus === 'rejected') {
            endpoint = `http://localhost:5000/api/orders/${orderId}/reject`;
            method = 'POST';
            body = null;
        }

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error(`Failed to update status: ${response.status} ${response.statusText}`);
            }

            const updatedOrder = await response.json();
            alert('Order status updated successfully!');
            // Optionally, refresh the order details
            fetchOrderDetails(orderId);
            // Update the order select dropdown to reflect the new status
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        }
    }

    // Function to capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Handle Order Status Update Form Submission
    statusForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from submitting normally
        const newStatus = statusSelect.value;
        const selectedOrderId = orderSelect.value;

        if (!selectedOrderId) {
            alert('Please select an order first.');
            return;
        }

        if (!newStatus) {
            alert('Please select a status to update.');
            return;
        }

        // Confirm with the user
        const confirmUpdate = confirm(`Are you sure you want to update the status to "${capitalizeFirstLetter(newStatus)}"?`);
        if (!confirmUpdate) return;

        // Update the order status
        updateOrderStatus(selectedOrderId, newStatus);
    });

    // Handle Order Selection Change
    orderSelect.addEventListener('change', () => {
        const selectedOrderId = orderSelect.value;
        // Update the URL with the selected orderId
        const newURL = `${window.location.pathname}?orderId=${selectedOrderId}`;
        window.history.pushState({ path: newURL }, '', newURL);
        // Fetch and display the selected order details
        fetchOrderDetails(selectedOrderId);
    });

    // Initial Fetch of Orders
    fetchOrders();

    // If there's an orderId in the URL, fetch its details
    const initialOrderId = getOrderIdFromURL();
    if (initialOrderId) {
        fetchOrderDetails(initialOrderId);
    }
});
