var stepsSlider2 = document.getElementById('slider-range2');
var input3 = document.getElementById('minAmount2');
var input4 = document.getElementById('maxAmount2');
var inputs2 = [input3, input4];
noUiSlider.create(stepsSlider2, {
    start: [149, 399],
    connect: true,
    step: 1,
    range: {
        'min': [0],
        'max': 2000
    },
});

stepsSlider2.noUiSlider.on('update', function (values, handle) {
    inputs2[handle].value = values[handle];
});

const apiUrl = 'http://localhost:3000/api/GetAllProducts';
let currentPage = 1;
const rowsPerPage = 10;
let products = [];

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        products = data;
        renderTable();
        setupPagination();
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

function renderTable() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    paginatedProducts.forEach(product => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>#${product.ProductID}</strong></td>
            <td>${product.Name}</td>
            <td><span class="badge ${product.Offer ? 'bg-success' : 'bg-danger'}">${product.Offer ? 'Available' : 'Not Available'}</span></td>
            <td>$${product.Price}</td>
            <td><span class="badge ${product.Status === 'in stock' ? 'bg-success' : product.Status === 'running low' ? 'bg-warning' : 'bg-danger'}">${product.Status}</span></td>
            <td>
                <span>${product.AvgRating}</span>
                <i class="icofont-star text-warning"></i>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <a href="product-edit.html?productId=${product.ProductID}" class="btn btn-outline-secondary">
                        <i class="icofont-edit text-success"></i>
                    </a>
                    <button type="button" class="btn btn-outline-danger">
                        <i class="icofont-ui-delete text-danger"></i>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function setupPagination() {
    const totalPages = Math.ceil(products.length / rowsPerPage);
    const paginationControls = document.getElementById("paginationControls");
    paginationControls.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("li");
        pageButton.classList.add("page-item");
        pageButton.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>`;
        paginationControls.appendChild(pageButton);
    }
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

let allProducts = [];

document.getElementById('searchInput').addEventListener('input', function() {
    const query = this.value.toLowerCase();

    if (query === '') {
        products = [...allProducts];
    } else {
        products = allProducts.filter(product => {
            return (
                product.Name.toLowerCase().includes(query) || 
                product.Description.toLowerCase().includes(query) || 
                product.Price.toString().toLowerCase().includes(query) ||
                product.Status.toLowerCase().includes(query) || 
                product.AvgRating.toString().includes(query)
            );
        });
    }

    currentPage = 1;
    renderTable();
    setupPagination();
});

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        allProducts = [...data];
        products = [...data];
        renderTable();
        setupPagination();
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

fetchProducts();
