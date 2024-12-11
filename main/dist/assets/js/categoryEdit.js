$(function () { 
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
            error: 'Désolé, le fichier est trop volumineux',
        },
    });
});

function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = getUserIdFromURL();

    if (!params) {
        alert("Category ID is missing!");
        return;
    }

    const apiUrl = `http://localhost:5000/api/category/${params}`;
    const categoryNameInput = document.getElementById("categoryName");
    const isActiveCheckbox = document.getElementById("isActive");
    const imageInput = document.getElementById("dropify-event");
    const saveButton = document.querySelector(".btn-primary");
    const statusMessage = document.getElementById("statusMessage");

    try {
        const response = await fetch(apiUrl,
            {
               method: "GET",
               headers: {
                   "Content-Type": "application/json",
                   Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                   cookie: 'authToken=' + sessionStorage.getItem("authToken"),
               },
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data); 

        categoryNameInput.value = data.Name || "";
        isActiveCheckbox.checked = !!data.IsActive;

        if (data.Image && data.Image.filePath) {
     
            const fixedPath = data.Image.filePath.replace(/\\/g, "/");
            const imagePath = `http://localhost:5000/${fixedPath}`;
        
            imageInput.setAttribute("data-default-file", imagePath);
        
            $(imageInput).dropify({
                defaultFile: imagePath,
            });
        }
         else {
            console.warn("No image filePath found in data.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        statusMessage.textContent = `Error fetching data: ${error.message}`;
        statusMessage.style.color = "red";
    }

    saveButton.addEventListener("click", async (e) => {
        e.preventDefault();

        statusMessage.textContent = "";

        const categoryName = categoryNameInput.value.trim();
        const isActive = isActiveCheckbox.checked;
        const imageFile = imageInput.files[0];

        if (!categoryName) {
            statusMessage.textContent = "Category name is required!";
            statusMessage.style.color = "red";
            return;
        }

        const formData = new FormData();
        formData.append("Name", categoryName);
        formData.append("IsActive", isActive);
        if (imageFile) {
            formData.append("file", imageFile);
        }

        try {
            const updateResponse = await fetch(`http://localhost:5000/api/category/${params}`, {
                method: "PUT",

                body: formData,

                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                    cookie: 'authToken=' + sessionStorage.getItem("authToken"),
                },
                
            });

            if (updateResponse.ok) {
                statusMessage.textContent = "Category updated successfully!";
                statusMessage.style.color = "green";
            } else {
                const errorDetails = await updateResponse.json();
                statusMessage.textContent = `Failed to update category. Error: ${errorDetails.message || "Unknown error"}`;
                statusMessage.style.color = "red";
            }
        } catch (error) {
            console.error("Error updating category:", error);
            statusMessage.textContent = `An error occurred while updating the category. Error: ${error.message}`;
            statusMessage.style.color = "red";
        }
    });
});
