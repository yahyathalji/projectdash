const apiUrl = 'http://localhost:3000/api';

// Load all users and populate the table
function loadUsers() {
    fetch(`${apiUrl}/get_all_users`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = ''; // Clear table

            // Add rows to table
            data.forEach(user => {
                const row = document.createElement('tr');

                const createdAt = new Date(user.CreatedAt).toLocaleDateString();
                const phoneNumber = user.PhoneNumber || '-';

                row.innerHTML = `
                    <td><strong>${user.UserID}</strong></td>
                    <td>
                        <a href="customer-detail.html?id=${user.UserID}">
                            <span class="fw-bold ms-1">${user.Username}</span>
                        </a>
                    </td>
                    <td>${createdAt}</td>
                    <td>${user.Email}</td>
                    <td>${phoneNumber}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-outline-secondary btn-edit" data-user-id="${user.UserID}" data-bs-toggle="modal" data-bs-target="#expedit">
                                <i class="icofont-edit text-success"></i>
                            </button>
                            <button type="button" class="btn btn-outline-secondary deleterow">
                                <i class="icofont-ui-delete text-danger"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            initializeDataTable();

            attachEditButtonListeners();
        })
        .catch(error => console.error('Error fetching users:', error));
}

// Initialize DataTable
function initializeDataTable() {
    if ($.fn.dataTable.isDataTable('#myProjectTable')) {
        $('#myProjectTable').DataTable().clear().destroy();
    }

    $('#myProjectTable').DataTable({
        responsive: true,
        pageLength: 10,   // Set the number of rows per page
        search: true,     // Enable dynamic search
        language: {
            search: "Search:",       
            lengthMenu: "Show _MENU_ rows", 
            info: "Showing _START_ to _END_ of _TOTAL_ entries",  
            infoEmpty: "No entries to show", 
            infoFiltered: "(filtered from _MAX_ total entries)", 
            zeroRecords: "No matching records found",  
            paginate: {
                first: "First",   
                previous: "Previous", 
                next: "Next",     
                last: "Last"      
            }
        },
        columnDefs: [
            { targets: [-1, -3], className: 'dt-body-right' }
        ]
    });
}

function attachEditButtonListeners() {
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', e => {
            const userId = e.target.closest('button').dataset.userId;
            loadUserData(userId); 
        });
    });
}

function loadUserData(userId) {
    // Fetch user data based on the userId
    fetch(`${apiUrl}/get_user_detail/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('item1').value = data.Username || '';
                document.getElementById('mailid').value = data.Email || '';
                document.getElementById('phoneid').value = data.PhoneNumber || '';
                document.getElementById('editForm').dataset.userId = userId;
            }
        })
        .catch(error => console.error('Error fetching user details:', error));
}

function refreshTableRow(user) {
    const row = document.querySelector(`button[data-user-id="${user.UserID}"]`).closest('tr');
    if (row) {
        const createdAt = new Date(user.CreatedAt).toLocaleDateString();
        row.querySelector('td:nth-child(2) .fw-bold').textContent = user.Username;
        row.querySelector('td:nth-child(4)').textContent = user.Email;
        row.querySelector('td:nth-child(5)').textContent = user.PhoneNumber || '-';
    }
}

function reloadPage() {
    alert('User updated successfully');
    window.location.reload(); 
}

document.getElementById('editForm').addEventListener('submit', function (e) {
    e.preventDefault(); 

    const userId = this.dataset.userId;

    const updatedData = {
        Username: document.getElementById('item1').value,
        Email: document.getElementById('mailid').value,
        PhoneNumber: document.getElementById('phoneid').value || null,
    };

    fetch(`${apiUrl}/update_user/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User updated successfully') {
                reloadPage();
            } else {
                alert('Error updating user: ' + data.message);
            }
        })
        .catch(error => console.error('Error updating user:', error));
});

loadUsers();
