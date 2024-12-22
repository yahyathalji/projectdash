$(document).ready(function () {
    const response =fetch("http://35.234.135.60:5000/api/categories/subcategories",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                cookie: 'authToken=' + sessionStorage.getItem("authToken"),
            },
        }   
    )
        .then(response => response.json())
        .then(data => {
            let subCategories = [];

            data.forEach(category => {
                category.SubCategory.forEach(subCategory => {
                    subCategories.push({
                        SubCategoryID: subCategory.SubCategoryID,
                        CategoryID: category.CategoryID,
                        Name: subCategory.Name,
                        IsActive: subCategory.IsActive ? 'IsActive' : 'Not-Active'
                    });
                });
            });

            const table = $('#myDataTable').DataTable({
                data: subCategories,
                columns: [
                    { data: 'SubCategoryID', title: 'Id' },
                    { data: 'Name', title: 'Subcategory' },
                    { 
                        data: 'IsActive', 
                        title: 'Status',
                        render: function (data, type, row) {
                            if (data === 'IsActive') {
                                return `<span class="badge bg-success">${data}</span>`;
                            } else {
                                return `<span class="badge bg-danger">${data}</span>`;
                            }
                        }
                    },
                    { 
                        data: null, 
                        title: 'Action',
                        render: function (data, type, row) {
                            return `<a href="SubCategory-edit.html?categoryId=${row.CategoryID}&subCategoryId=${row.SubCategoryID}" 
                                        class="btn btn-outline-secondary">
                                        <i class="icofont-edit text-success"></i>
                                    </a>`;
                        }
                    }
                ],
                pageLength: 10,
                responsive: true,
                searching: true,
                ordering: true,
                columnDefs: [
                    { targets: [-1, -3], className: 'dt-body-right' }
                ]
            });

            $('#myDataTable').DataTable().draw();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
        
    $('.deleterow').on('click', function () {
        var table = $(this).closest('table').DataTable();
        table
            .row($(this).parents('tr'))
            .remove()
            .draw();
    });
});
    