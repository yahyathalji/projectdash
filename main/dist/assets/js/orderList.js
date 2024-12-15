document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#myDataTable tbody");
    const statusFilter = document.getElementById('statusFilter');
    const applyFilterButton = document.getElementById('applyFilterButton');
    const apiUrl = "http://localhost:5000/api/orders/admin";
    let allOrders = []; // To store all fetched orders

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
            emptyTable: "No orders available"
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
        }
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

    // Function to fetch all orders
    function fetchAllOrders() {
        fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            allOrders = data; // Store all orders
            applyFilter(); // Apply initial filter
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            dataTable.clear().draw();
            dataTable.row.add(`<tr><td colspan="4" class="text-center text-danger">Failed to load data</td></tr>`).draw();
        });
    }

    // Function to apply filter and update DataTable
    function applyFilter() {
        const selectedStatus = statusFilter.value;
        let filteredData = allOrders;

        if (selectedStatus) {
            filteredData = allOrders.filter(order => 
                order.Status.toLowerCase() === selectedStatus.toLowerCase()
            );
        }

        // Clear existing data
        dataTable.clear();

        // Add new filtered data
        dataTable.rows.add(filteredData).draw();
    }

    // Handle apply filter button click
    applyFilterButton.addEventListener('click', () => {
        applyFilter();
    });

    // Initial fetch of all orders
    fetchAllOrders();
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
