$(document).ready(function() {
    $.ajax({
        url: 'http://localhost:5000/api/categories',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
            cookie: 'authToken=' + sessionStorage.getItem('authToken')
        },

        success: function(data) {
            const selectElement = $('select.form-select');
            selectElement.empty();
            selectElement.append('<option value="">Select Parent Category</option>');

            data.forEach(function(category) {
                selectElement.append(
                    `<option value="${category.CategoryID}">${category.Name}</option>`
                );
            });
        },
        error: function(error) {
            console.log('Error fetching categories:', error);
        }
    });

    

    $("#tbproduct").on('click', '.deleterow', function () {
        $(this).closest('tr').remove();
    });

   

    $('button[type="submit"]').on('click', function(event) {
        event.preventDefault(); 

        const name = $('#subcategoryName').val();
        const isActive = $('#isActive').prop('checked');
        const parentCategoryId = $('#parentCategorySelect').val();

        if (!name || !parentCategoryId) {
            $('#message').text('Please fill all required fields').addClass('text-danger');
            return;
        }

        const categoryId = parentCategoryId; 
        $.ajax({
            url: `http://localhost:5000/api/categories/${categoryId}/subcategories`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
                cookie: 'authToken=' + sessionStorage.getItem('authToken')
            },
            data: {
                Name: name,
                IsActive: isActive,
                ParentCategoryId: parentCategoryId
            },

            success: function(response) {
                $('#message').text('Subcategory added successfully!').removeClass('text-danger').addClass('text-success');
            },
            error: function(error) {
                $('#message').text('Failed to add subcategory. Please try again.').removeClass('text-success').addClass('text-danger');
            }
        });
    });
});
