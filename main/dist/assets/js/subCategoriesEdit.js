$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const subCategoryId = urlParams.get("subCategoryId");
    const categoryId = urlParams.get("categoryId");
    console.log("SubCategoryID from URL:", subCategoryId);
    console.log("CategoryID from URL:", categoryId);

    $.ajax({
        url: 'http://localhost:3000/api/categories/subcategories',
        method: 'GET',
        success: function (data) {
            console.log("Data fetched from API:", data); 

            let foundSubCategory = null;
            data.forEach(category => {
                if (category.CategoryID == categoryId) {
                    const subCategory = category.SubCategory.find(sc => sc.SubCategoryID == subCategoryId);
                    if (subCategory) {
                        foundSubCategory = subCategory;
                    }
                }
            });

            if (foundSubCategory) {
                console.log("Found SubCategory:", foundSubCategory); 
                $('#subCategoryName').val(foundSubCategory.Name);
                $('#isActive').prop('checked', foundSubCategory.IsActive);
            } else {
                console.error("Subcategory not found with the given ID.");
                alert("Subcategory not found with the given ID.");
            }
        },
        error: function (error) {
            console.error('Error fetching subcategories:', error);
            alert("Error fetching data from the server.");
        }
    });

    const editorElement = document.querySelector('#editor');
    if (editorElement) {
        ClassicEditor.create(editorElement).catch(error => {
            console.error('CKEditor Initialization Error:', error);
        });
    } else {
        console.warn('#editor element not found!');
    }

    $("#tbproduct").on('click', '.deleterow', function () {
        $(this).closest('tr').remove();
    });

    $('.dropify').dropify();
    const drEvent = $('#dropify-event').dropify();

    drEvent.on('dropify.beforeClear', function (event, element) {
        return confirm(`Do you really want to delete "${element.file.name}"?`);
    });

    drEvent.on('dropify.afterClear', function () {
        alert('File deleted');
    });

    $('.dropify-fr').dropify({
        messages: {
            default: 'Glissez-déposez un fichier ici ou cliquez',
            replace: 'Glissez-déposez un fichier ou cliquez pour remplacer',
            remove: 'Supprimer',
            error: 'Désolé, le fichier est trop volumineux'
        }
    });

    $.ajax({
        url: 'http://localhost:3000/api/categories',
        method: 'GET',
        success: function (data) {
            const selectElement = $('select.form-select');
            selectElement.empty();

            data.forEach(function (category) {
                selectElement.append(
                    `<option value="${category.CategoryID}">${category.Name}</option>`
                );
            });

            if (categoryId) {
                selectElement.val(categoryId);
            }
        },
        error: function (error) {
            console.error('Error fetching categories:', error);
        }
    });

    $('#saveButton').on('click', function (e) {
        e.preventDefault();

        const name = $('#subCategoryName').val();
        const isActive = $('#isActive').prop('checked');
        const parentCategoryId = $('#parentCategorySelect').val();

  
        const data = {
            Name: name,
            IsActive: isActive,
            CategoryId: parentCategoryId
        };

        $.ajax({
            url: `http://localhost:3000/api/categories/${categoryId}/subcategories/${subCategoryId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                console.log('Subcategory updated successfully:', response);
                $('#responseMessage').html('<div class="alert alert-success">Subcategory updated successfully!</div>');
            },
            error: function (error) {
                console.error('Error updating subcategory:', error);
                $('#responseMessage').html('<div class="alert alert-danger">Error updating subcategory.</div>');
            }
        });
    });
});
