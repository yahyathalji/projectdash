        
        $(document).ready(function() {
        $('#myProjectTable')
        .addClass( 'nowrap' )
        .dataTable( {
            responsive: true,
            columnDefs: [
                { targets: [-1, -3], className: 'dt-body-right' }
            ]
        });
    });
   
    // ------------------------
    document.addEventListener("DOMContentLoaded", function () {
        const colorInput = document.getElementById('colorInput');
        const addColorButton = document.getElementById('addColorButton');
        const selectedColorsContainer = document.getElementById('selectedColorsContainer');

        let selectedColors = [];

        // Add color to the selected colors container
        addColorButton.addEventListener('click', function () {
            const colorValue = colorInput.value;

            // Avoid duplicates
            if (selectedColors.includes(colorValue)) {
                alert("This color is already selected!");
                return;
            }

            selectedColors.push(colorValue);

            // Convert the color to the format 0xFF
            const colorHex = colorValue.substring(1).toUpperCase();  // Remove # and capitalize
            const formattedColor = "0xFF" + colorHex;

            // Create color button
            const colorButton = document.createElement('button');
            colorButton.className = 'custom-color-btn';
            colorButton.style.backgroundColor = colorValue;
            colorButton.textContent = formattedColor; // Display 0xFF format

            // Add click event for removal
            colorButton.addEventListener('click', function () {
                const index = selectedColors.indexOf(colorButton.style.backgroundColor);
                if (index > -1) {
                    selectedColors.splice(index, 1);
                    colorButton.remove();
                }
            });

            selectedColorsContainer.appendChild(colorButton);
        });

        // Handle form submission
        document.getElementById('submitCustomizations').addEventListener('click', function () {
            if (selectedColors.length === 0) {
                alert("Please select at least one color!");
                return;
            }

            // Show selected colors in the console
            console.log({
                selectedColors: selectedColors
            });

            alert("Customizations saved successfully!");
        });
    });



    document.addEventListener("DOMContentLoaded", function () {
        const imageInput = document.getElementById('imageInput');
        const uploadedImage = document.getElementById('uploadedImage');
        const imageCard = document.getElementById('imageCard');
        const increaseSizeBtn = document.getElementById('increaseSizeBtn');
        const decreaseSizeBtn = document.getElementById('decreaseSizeBtn');
        const colorInput = document.getElementById('colorInput');
        const selectedColorContainer = document.getElementById('selectedColorContainer');

        // Variable to keep track of image size
        let imageSize = 300; // Initial size (width and height) of the image

        // When image is uploaded, display it in the card
        imageInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                uploadedImage.src = e.target.result;
                uploadedImage.classList.remove('d-none');
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        });

        // Increase the image size
        increaseSizeBtn.addEventListener('click', function () {
            imageSize += 20;
            uploadedImage.style.width = `${imageSize}px`;
            uploadedImage.style.height = `${imageSize}px`;
        });

        // Decrease the image size
        decreaseSizeBtn.addEventListener('click', function () {
            if (imageSize > 100) { // Minimum size
                imageSize -= 20;
                uploadedImage.style.width = `${imageSize}px`;
                uploadedImage.style.height = `${imageSize}px`;
            }
        });

        // Color Customization (change card color)
        colorInput.addEventListener('input', function () {
            const selectedColor = colorInput.value;
            imageCard.style.backgroundColor = selectedColor;

            // Show selected color under the card
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = selectedColor;
            selectedColorContainer.innerHTML = ''; // Clear previous color boxes
            selectedColorContainer.appendChild(colorBox);
        });
    });



        // Handle button selection
        const sizeButtons = document.querySelectorAll('.size-button');
        sizeButtons.forEach(button => {
            button.addEventListener('click', function () {
                sizeButtons.forEach(b => b.classList.remove('btn-primary'));
                sizeButtons.forEach(b => b.classList.add('btn-outline-primary'));
                button.classList.add('btn-primary');
                button.classList.remove('btn-outline-primary');
            });
        });

        // Handle form submission
        document.getElementById('submitCustomizations').addEventListener('click', function () {
            const selectedColor = document.querySelector('.color-circle.selected')?.getAttribute('data-value');
            const selectedSize = document.querySelector('.size-button.btn-primary')?.getAttribute('data-value');
            const attachedMessage = document.querySelector('textarea').value;
            const attachedPicture = document.querySelector('input[type="file"]').files[0]?.name;

            // Show customization data in the console
            console.log({
                selectedColor: selectedColor || "No color selected",
                selectedSize: selectedSize || "No size selected",
                attachedMessage: attachedMessage || "No message attached",
                attachedPicture: attachedPicture || "No picture attached"
            });

            alert("Customizations saved successfully!");
        });


