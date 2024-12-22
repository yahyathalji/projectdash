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
            { data: 'OrderID', title: 'Order-Id' },
            { data: 'User.Username', title: 'Customer Name' },
            { data: 'TotalPrice', title: 'Price' },
            { data: 'Status', title: 'Status' }
        ],
        createdRow: function(row, data, dataIndex) {
            // Customize the row after creation
            // Order ID link
            const orderIdCell = row.cells[0];
            orderIdCell.innerHTML = `<a href="order-details.html?orderId=${encodeURIComponent(data.OrderID)}"><strong>#Order-${escapeHtml(data.OrderID)}</strong></a>`;

            // Customer Name
            const customerName = data.User && data.User.Username ? escapeHtml(data.User.Username) : "Unknown";
            row.cells[1].textContent = customerName;

            // Price formatting
            row.cells[2].textContent = `$${Number(data.TotalPrice).toFixed(2)}`;

            // Status badge
            const status = mapStatus(data.Status);
            row.cells[3].innerHTML = `<span class="badge ${status.class}">${capitalizeFirstLetter(status.label)}</span>`;
        },
        // Optionally, handle error in DataTables' initComplete or drawCallback
    });

    // Function to map status to label and class
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

    // Function to fetch orders (all or filtered by status)
    async function fetchOrders(status = '') {
        // Hide any previous error message
        errorMessage.classList.add('d-none');
        errorMessage.textContent = '';

        try {
            let response;
            let data;

            if (status && status.toLowerCase() !== 'all') {
                // Use the search API with POST method
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
                response = await fetch(adminApiUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                    },
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            data = await response.json();

            // Clear existing data
            dataTable.clear();

            if (Array.isArray(data) && data.length > 0) {
                // Add new data
                dataTable.rows.add(data).draw();
            } else {
                // No data available
                dataTable.draw(); // Triggers DataTables to show 'emptyTable' or 'zeroRecords' message
            }

        } catch (error) {
            console.error("Error fetching data:", error);

            // Clear existing data
            dataTable.clear().draw();

            // Optionally, display an error message
            errorMessage.textContent = "no orders found";
            errorMessage.classList.remove('d-none');
        }
    }

    // Handle apply filter button click
    applyFilterButton.addEventListener('click', () => {
        const selectedStatus = statusFilter.value;
        fetchOrders(selectedStatus);
    });

    // Initial fetch of all orders
    fetchOrders();
});

// Utility function to capitalize the first letter
function capitalizeFirstLetter(string) {
    if (typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Utility function to escape HTML to prevent XSS
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
