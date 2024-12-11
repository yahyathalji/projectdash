document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#myDataTable tbody");

    const table = $('#myDataTable').DataTable({
        responsive: true,
        paging: true,
        searching: true,
        ordering: true,
        columnDefs: [
            { targets: [-1, -3], className: 'dt-body-right' }
        ]
    });

    try {
        const response = await fetch("http://localhost:5000/api/categories",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                    cookie: 'authToken=' + sessionStorage.getItem("authToken"),
                },
            }

        );
        const categories = await response.json();

        table.clear();

        if (response.ok && categories.length > 0) {
            categories.forEach((category) => {
                table.row.add([ 
                    `<strong>#${category.CategoryID}</strong>`,
                    category.Name,
                    `<span class="badge ${category.IsActive ? "bg-success" : "bg-danger"}">${category.IsActive ? "Active" : "Not-Active"}</span>`,
                    `<div class="btn-group" role="group">
                        <a href="categories-edit.html?id=${category.CategoryID}" 
                           class="btn btn-outline-secondary">
                            <i class="icofont-edit text-success"></i>
                        </a>
                    </div>`
                ]).draw();  
            });
        } else {
            table.row.add([ 
                'No categories found.',
                '',
                '',
                ''
            ]).draw();
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        table.row.add([ 
            'Error loading categories. Please try again later.',
            '',
            '',
            ''
        ]).draw();
    }
});
