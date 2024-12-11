document.addEventListener("DOMContentLoaded", () => {
    var stepsSlider2 = document.getElementById('slider-range2');
    var input3 = document.getElementById('minAmount2');
    var input4 = document.getElementById('maxAmount2');
    var inputs2 = [input3, input4];

    if (stepsSlider2 && input3 && input4) {
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
    } else {
        console.warn("Slider elements not found. Slider functionality will not work.");
    }

    const apiUrl = 'http://localhost:5000/api/GetAllProducts';
    let currentPage = 1;
    const rowsPerPage = 10;
    let products = [];
    let allProducts = [];

    // Helper function to get a cookie by name
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }

    async function fetchProducts() {
        try {
            

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                    cookie: 'authToken=' + sessionStorage.getItem("authToken"),
                },
            });

            if (!response.ok) {
                console.error("Response error:", response.status, response.statusText);
                return;
            }

            const data = await response.json();

            // Update products arrays
            allProducts = [...data];
            products = [...data];

            renderTable();
            setupPagination();
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    function renderTable() {
        const tableBody = document.getElementById("tableBody");
        if (!tableBody) {
            console.error("tableBody element not found.");
            return;
        }

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedProducts = products.slice(startIndex, endIndex);

        tableBody.innerHTML = "";

        paginatedProducts.forEach(product => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><strong>#${product.ProductID}</strong></td>
                <td>${product.Name}</td>
                <td><span class="badge ${product.Offer ? 'bg-success' : 'bg-danger'}">${product.Offer ? 'Available' : 'Not Available'}</span></td>
                <td>$${product.Price}</td>
                <td><span class="badge ${
                    product.Status === 'in stock' ? 'bg-success' 
                    : product.Status === 'running low' ? 'bg-warning' 
                    : 'bg-danger'}">${product.Status}</span></td>
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
        const paginationControls = document.getElementById("paginationControls");

        if (!paginationControls) {
            console.error("paginationControls element not found.");
            return;
        }
        
        paginationControls.innerHTML = "";

        const totalPages = Math.ceil(products.length / rowsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("li");
            pageButton.classList.add("page-item");
            pageButton.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>`;
            paginationControls.appendChild(pageButton);
        }
    }

    // Make goToPage accessible by attaching to window
    window.goToPage = function(page) {
        currentPage = page;
        renderTable();
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();

            if (query === '') {
                products = [...allProducts];
            } else {
                products = allProducts.filter(product => {
                    return (
                        product.Name.toLowerCase().includes(query) || 
                        (product.Description && product.Description.toLowerCase().includes(query)) ||
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
    } else {
        console.warn("searchInput element not found. Search functionality will not work.");
    }

    // Fetch products once the DOM is loaded
    fetchProducts();
});
