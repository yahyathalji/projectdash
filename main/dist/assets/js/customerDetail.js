function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

console.log(getUserIdFromURL());
const params =getUserIdFromURL();


document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#myDataTable tbody");
    const apiUrl = `http://localhost:5000/api/get_user_detail/${params}`;

    // Fetch data from API
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
            ProfileAndAddress(data);
            initializeDataTable();
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No data available</td></tr>`;
        });
});

function renderTableData(data, tableBody) {
    console.log(data.Orders);
    let rows = "";
// console.log(data.Orders.length);
// console.log(data.Orders);
    if (data.Orders.length === 0) {
        rows = `<tr><td colspan="4" class="text-center">No data available</td></tr>`;
    } else {
        data.Orders.forEach((order) => {
            const createdAt = new Date(order.CreatedAt);  
            rows += `
                <tr>
                    <td><a href="order-details.html?orderId=${order.OrderID}"><strong>#Order-${order.OrderID}</strong></a></td>
                    <td>${createdAt.toLocaleDateString()}</td>
                    <td>$${order.TotalPrice}</td>
                </tr>
            `;
        });
    }

    tableBody.innerHTML = rows;
}

function ProfileAndAddress(data){
    
    const userId= document.getElementById("userId");
    const userName= document.getElementById("userCustomer");
    const PhoneNumber= document.getElementById("PhoneNumber");
    const Email= document.getElementById("Email");
    const dateofbirth= document.getElementById("dateofbirth");

    const AddressLine= document.getElementById("AddressLine");
    const PostalCode= document.getElementById("PostalCode");
    const City= document.getElementById("City");
    const State= document.getElementById("State");
    const Country= document.getElementById("Country");



    userId.textContent=` ID:${data.UserID}`;
    userName.textContent=data.Username ||"-";
    PhoneNumber.textContent=data.PhoneNumber ||"-";
    PhoneNumber.textContent=data.PhoneNumber ||"-";
    Email.textContent=data.Email ||"-";
    dateofbirth.textContent=data.dateofbirth ||"-";

    // data.Addresses.forEach(Addresses => {
    //     AddressLine.textContent=Addresses.AddressLine ||"-";
    //     PostalCode.textContent=Addresses.PostalCode ||"-";
    //     City.textContent=Addresses.City ||"-";
    //     State.textContent=Addresses.State ||"-";
    //     Country.textContent=Addresses.Country ||"-";
        
    // });
    const address = data.Addresses[0];

if (address) {  
    AddressLine.textContent = address.AddressLine || "-";
    PostalCode.textContent = address.PostalCode || "-";
    City.textContent = address.City || "-";
    State.textContent = address.State || "-";
    Country.textContent = address.Country || "-";
}
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
