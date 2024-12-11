document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#myDataTable tbody");
    const apiUrl = "http://localhost:5000/api/orders/admin";

    fetch(apiUrl,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                cookie: 'authToken=' + sessionStorage.getItem("authToken"),
            },
        }
    
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            renderTableData(data, tableBody);
            initializeDataTable(); 
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Failed to load data</td></tr>`;
        });
});

function renderTableData(data, tableBody) {
    let rows = "";

    if (data.length === 0) {
        rows = `<tr><td colspan="4" class="text-center">No data available</td></tr>`;
    } else {
        data.forEach((order) => {
            rows += `
                <tr>
                    <td><a href="order-details.html?orderId=${order.OrderID}"><strong>#Order-${order.OrderID}</strong></a></td>
                    <td>${order.User ? order.User.Username : "Unknown"}</td>
                    <td>$${order.TotalPrice}</td>
                    <td>
                        <span class="badge ${
                            order.Status ? "bg-success" : "bg-danger"
                        }">
                            ${order.Status ? "Complete" : "Pending"}
                        </span>
                    </td>
                </tr>
            `;
        });
    }

    tableBody.innerHTML = rows;
}

// Initialize DataTables with search functionality
function initializeDataTable() {
    $('#myDataTable').DataTable({
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
        }
    });
}
