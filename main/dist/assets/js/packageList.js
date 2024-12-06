let allPackages = [];
let packages = [];
const rowsPerPage = 10;
let currentPage = 1;

function setupPagination() {
    const totalPages = Math.ceil(packages.length / rowsPerPage);
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

function renderTable() {
    const packageListBody = document.getElementById("packageListBody");
    packageListBody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedPackages = packages.slice(start, end);

    paginatedPackages.forEach(packageItem => {
        const offerStatus = packageItem.Offer && packageItem.Offer.IsActive ? 'Available' : 'Not Available';
        const offerClass = packageItem.Offer && packageItem.Offer.IsActive ? 'bg-success' : 'bg-danger';

        let statusClass = '';
        let statusText = '';
        if (packageItem.Status === 'in stock') {
            statusClass = 'bg-success';
            statusText = 'in stock';
        } else if (packageItem.Status === 'out of stock') {
            statusClass = 'bg-danger';
            statusText = 'out of stock';
        } else if (packageItem.Status === 'running low') {
            statusClass = 'bg-warning';
            statusText = 'running low';
        } else {
            statusClass = 'bg-secondary';
            statusText = 'Unknown';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${packageItem.PackageID}</strong></td>
            <td>${packageItem.Name}</td>
            <td><span class="badge ${offerClass}">${offerStatus}</span></td>
            <td>$${packageItem.Price}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                <span>${packageItem.AvgRating}</span>
                <i class="icofont-star text-warning"></i>
            </td>
            <td>
                <div class="btn-group" role="group" aria-label="Basic outlined example">
                    <button class="btn btn-outline-secondary edit-btn" onclick="editPackage(${packageItem.PackageID})">
                        <i class="icofont-edit text-success"></i>
                    </button>
                    <button class="btn btn-outline-danger delete-btn">
                        <i class="icofont-ui-delete text-danger"></i>
                    </button>
                </div>
            </td>
        `;
        packageListBody.appendChild(tr);
    });
}
function editPackage(packageID) {
    window.location.href = `package-edit.html?packageID=${packageID}`;
}

document.getElementById('searchInput').addEventListener('input', function() {
    const query = this.value.toLowerCase();

    if (query === '') {
        packages = [...allPackages];
    } else {
        packages = allPackages.filter(packageItem => {
            return (
                packageItem.Name.toLowerCase().includes(query) || 
                packageItem.Price.toString().toLowerCase().includes(query) ||
                packageItem.Status.toLowerCase().includes(query) || 
                packageItem.AvgRating.toString().includes(query)
            );
        });
    }

    currentPage = 1;
    renderTable();
    setupPagination();
});

async function fetchPackages() {
    try {
        const response = await fetch('http://localhost:3000/api/packages');
        const data = await response.json();
        allPackages = [...data];
        packages = [...data];
        renderTable();
        setupPagination();
    } catch (error) {
        console.error("Error fetching packages:", error);
    }
}

fetchPackages();