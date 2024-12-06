function extractFirstImage(resources) {
    if (!resources || !Array.isArray(resources)) return null;
    return resources.find(resource => resource.fileType.startsWith("image/")) || null;
}

function fetchOrders() {
    fetch('http://localhost:3000/api/orders/admin')
        .then(response => response.json())
        .then(data => {
            if (data && Array.isArray(data)) {
                populateOrderDropdown(data);
            } else {
                console.error('Invalid data structure received:', data);
            }
        })
        .catch(error => console.error('Error fetching orders:', error));
}

function populateOrderDropdown(orders) {
    const selectElement = document.getElementById("orderSelect");
    selectElement.innerHTML = ''; 

    const placeholderOption = document.createElement("option");
    placeholderOption.value = ""; 
    placeholderOption.textContent = "Select Order";
    placeholderOption.disabled = true; 
    placeholderOption.selected = true; 
    selectElement.appendChild(placeholderOption);

    orders.forEach(order => {
        const option = document.createElement("option");
        option.value = order.OrderID; 
        option.textContent = `Order-${order.OrderID}`;
        selectElement.appendChild(option);
    });

    updatePageContent();
}

function getOrderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orderId');
}

function updatePageContent() {
    const orderId = getOrderIdFromURL();
    const selectElement = document.getElementById("orderSelect");
    const orderTitle = document.getElementById("orderTitle");

    if (orderId) {
        selectElement.value = orderId;
        orderTitle.textContent = `Order Details: #Order${orderId}`;
    }
}

document.getElementById("orderSelect").addEventListener("change", function() {
    const orderId = this.value;
    const newURL = `order-details.html?orderId=${orderId}`;

    window.history.pushState({ path: newURL }, '', newURL);

    updatePageContent();
    window.location.reload();
});

fetchOrders();

const param = getOrderIdFromURL();

const customerName = document.getElementById("customerName");
const userEmail = document.getElementById("userEmail");
const PhoneNumber = document.getElementById("PhoneNumber");
const OrderCreatedAt = document.getElementById("OrderCreatedAt");
const AddressLine = document.getElementById("AddressLine");
const PostalCode = document.getElementById("PostalCode");
const City = document.getElementById("City");
const State = document.getElementById("State");
const Country = document.getElementById("Country");
const Phone = document.getElementById("Phone");

const cartTableBody = document.getElementById('cartTableBody');
const totalPayable = document.getElementById('totalPayable');
let total = 0;

cartTableBody.innerHTML = '';

const url = `http://localhost:3000/api/orders/${param}`;

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const createdAt = new Date(data.CreatedAt);
        OrderCreatedAt.textContent = createdAt.toLocaleDateString();
        customerName.textContent = data.User.Username;
        userEmail.textContent = data.User.Email;
        PhoneNumber.textContent = data.User.PhoneNumber;
        AddressLine.textContent = data.Address.AddressLine;
        PostalCode.textContent = data.Address.PostalCode;
        City.textContent = data.Address.City;
        State.textContent = data.Address.State;
        Country.textContent = data.Address.Country;
        Phone.textContent = data.User.PhoneNumber;
        
        total = data.TotalPrice;
        totalPayable.textContent = `$ ${total}`;

        data.OrdersProducts.forEach(OrdersProducts => {
            const row = document.createElement('tr');
            const imgCell = document.createElement('td');
            const firstImage = extractFirstImage(OrdersProducts.Product.Resource);
            console.log("firstImage product",firstImage);
            if (firstImage) {
                const imagePath = `http://localhost:3000/${firstImage.filePath.replace(/\\/g, '/')}`;
                imgCell.innerHTML = `<img src="${imagePath}" class="avatar rounded lg" style="width: 100px; height: auto;" alt="${OrdersProducts.Product.Name}">`;
            } else {
                imgCell.textContent = "No image available";
            }

            row.appendChild(imgCell);

            const nameCell = document.createElement('td');
            nameCell.innerHTML = `<h6 class="title">${OrdersProducts.Product.Name}</h6>`;
            row.appendChild(nameCell);

            const quantityCell = document.createElement('td');
            quantityCell.textContent = OrdersProducts.Quantity;
            row.appendChild(quantityCell);

            const priceCell = document.createElement('td');
            priceCell.innerHTML = `<p class="price">$${OrdersProducts.TotalPrice}</p>`;
            row.appendChild(priceCell);

            cartTableBody.appendChild(row);
        });

        data.OrdersPackages.forEach(OrdersPackages => {
            const row = document.createElement('tr');
            const imgCell = document.createElement('td');
            const firstImage = extractFirstImage(OrdersPackages.Package.Resource);
            console.log("firstImage Pkg",firstImage);
            if (firstImage) {
                const imagePath = `http://localhost:3000${firstImage.filePath.replace(/\\/g, '/')}`;
                imgCell.innerHTML = `<img src="${imagePath}" class="avatar rounded lg" style="width: 100px; height: auto;" alt="${OrdersPackages.Package.Name}">`;
            } else {
                imgCell.textContent = "No image available";
            }

            row.appendChild(imgCell);

            const nameCell = document.createElement('td');
            nameCell.innerHTML = `<h6 class="title">${OrdersPackages.Package.Name}</h6>`;
            row.appendChild(nameCell);

            const quantityCell = document.createElement('td');
            quantityCell.textContent = OrdersPackages.quantity;
            row.appendChild(quantityCell);

            const priceCell = document.createElement('td');
            priceCell.innerHTML = `<p class="price">$${OrdersPackages.TotalPrice}</p>`;
            row.appendChild(priceCell);

            cartTableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
