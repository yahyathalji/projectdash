document.addEventListener("DOMContentLoaded", () => {
    const statusFilter = document.getElementById('statusFilter');
    const applyFilterButton = document.getElementById('applyFilterButton');
    const adminApiUrl = "http://35.234.135.60:5000/api/orders/admin";
    const searchApiUrl = "http://35.234.135.60:5000/search/order";
    const errorMessage = document.getElementById('errorMessage');

    // Initialize DataTable once
    const dataTable = $('#myDataTable').DataTable({
        responsive: true,
        autoWidth: false,
        paging: true, 
        searching: true, 
        info: true, 
        lengthMenu: [10, 25, 50, 100], 
        columnDefs: [
            { targets: [-1, -3], className: 'dt-body-right' }
        ],
        language: {
            search: "Search Orders:", 
            lengthMenu: "Show _MENU_ orders per page",
            info: "Showing _START_ to _END_ of _TOTAL_ orders",
            infoFiltered: "(filtered from _MAX_ total orders)",
            zeroRecords: "No matching orders found",
            emptyTable: "No orders available",
            loadingRecords: "Loading orders...",
            processing: "Processing...",
            paginate: {
                first: "First",
                last: "Last",
                next: "Next",
                previous: "Previous"
            },
            // Customize other language options as needed
        },
        data: [], // Initialize with empty data
        columns: [
            { 
                data: 'OrderID', 
                title: 'Order ID',
                render: function(data, type, row) {
                    return `<a href="order-details.html?orderId=${encodeURIComponent(data)}"><strong>#Order-${escapeHtml(data)}</strong></a>`;
                }
            },
            { 
                data: 'CustomerName', 
                title: 'Customer Name',
                render: function(data, type, row) {
                    if (data) {
                        return escapeHtml(data.trim());
                    } else {
                        console.warn(`OrderID: ${row.OrderID} - CustomerName missing`);
                        return 'Unknown';
                    }
                }
            },
            { 
                data: 'Price', 
                title: 'Price',
                render: function(data, type, row) {
                    const priceNumber = parseFloat(data);
                    if (isNaN(priceNumber)) {
                        console.warn(`OrderID: ${row.OrderID} - Invalid Price: ${data}`);
                        return `$0.00`;
                    }
                    return `$${priceNumber.toFixed(2)}`;
                }
            },
            { 
                data: 'Status', 
                title: 'Status',
                render: function(data, type, row) {
                    const status = mapStatus(data);
                    return `<span class="badge ${status.class}">${capitalizeFirstLetter(status.label)}</span>`;
                }
            }
        ],
    });

    /**
     * Maps the order status to corresponding label and CSS class for styling.
     * @param {string} status - The status of the order.
     * @returns {Object} An object containing the label and CSS class.
     */
    function mapStatus(status) {
        const statusMap = {
            'pending': { label: 'Pending', class: 'bg-warning' },
            'purchased': { label: 'Purchased', class: 'bg-primary' },
            'under review': { label: 'Under Review', class: 'bg-secondary' },
            'rejected': { label: 'Rejected', class: 'bg-danger' },
            'shipped': { label: 'Shipped', class: 'bg-info' },
            'delivered': { label: 'Delivered', class: 'bg-success' },
            'returned': { label: 'Returned', class: 'bg-dark' },
            'canceled': { label: 'Canceled', class: 'bg-danger' },
            'completed': { label: 'Completed', class: 'bg-success' }
        };
        return statusMap[status.toLowerCase()] || { label: status || 'Unknown', class: 'bg-light' };
    }

    /**
     * Fetches orders from the API, either all orders or filtered by status.
     * @param {string} status - The status to filter orders by. Defaults to fetching all orders.
     */
    async function fetchOrders(status = '') {
        // Hide any previous error message
        errorMessage.classList.add('d-none');
        errorMessage.textContent = '';

        try {
            let response;
            let data;

            if (status && status.toLowerCase() !== 'all') {
                // Use the search API with POST method
                console.log(`Fetching orders with status: ${status}`);
                response = await fetch(searchApiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                    },
                    body: JSON.stringify({
                        search: {
                            Status: status.toLowerCase()
                        }
                    })
                });
            } else {
                // Use the admin API with GET method
                console.log(`Fetching all orders`);
                response = await fetch(adminApiUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                    },
                });
            }

            if (!response.ok) {
                // Attempt to parse error details from the response
                let errorText = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorText = errorData.message || errorText;
                } catch (jsonError) {
                    console.warn("Failed to parse error response as JSON:", jsonError);
                }
                throw new Error(errorText);
            }

            data = await response.json();
            console.log("Fetched data:", data); // Log fetched data for debugging

            // Clear existing data
            dataTable.clear();

            if (Array.isArray(data) && data.length > 0) {
                // Add new data
                dataTable.rows.add(data).draw();
            } else {
                // No data available
                dataTable.draw(); // Triggers DataTables to show 'emptyTable' or 'zeroRecords' message
                errorMessage.textContent = "No orders available.";
                errorMessage.classList.remove('d-none');
            }

        } catch (error) {
            console.error("Error fetching data:", error);

            // Clear existing data
            dataTable.clear().draw();

            // Display a user-friendly error message
            errorMessage.textContent = error.message || "An unexpected error occurred while fetching orders.";
            errorMessage.classList.remove('d-none');
        }
    }

    // Handle apply filter button click
    applyFilterButton.addEventListener('click', () => {
        const selectedStatus = statusFilter.value;
        console.log(`Apply Filter clicked with status: '${selectedStatus}'`);
        fetchOrders(selectedStatus);
    });

    // Initial fetch of all orders
    fetchOrders();
});

/**
 * Capitalizes the first letter of a given string.
 * @param {string} string - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalizeFirstLetter(string) {
    if (typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Escapes HTML characters in a string to prevent XSS attacks.
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
