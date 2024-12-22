// assets/js/indexDashboard.js

let expenseChart; // Global variable to hold the chart instance

// Function to initialize or update the chart
function updateChart(data) {
  const options = {
    series: [
      {
        name: "Costs",
        data: data,
      },
    ],
    chart: {
      height: 315,
      type: "bar",
      toolbar: { show: false },
    },
    colors: ["var(--chart-color2)"],
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top", // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + "$";
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["var(--color-500)"],
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      position: "bottom",
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: true },
    },
    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        show: false,
        formatter: function (val) {
          return val + "$";
        },
      },
    },
  };

  if (expenseChart) {
    expenseChart.updateOptions({
      series: [
        {
          name: "Costs",
          data: data,
        },
      ],
    });
  } else {
    expenseChart = new ApexCharts(
      document.querySelector("#apex-expense"),
      options
    );
    expenseChart.render();
  }
}

// Function to initialize DataTables safely
function initializeDataTable(tableId) {
  if ($.fn.DataTable.isDataTable(tableId)) {
    $(tableId).DataTable().clear().destroy();
  }

  return $(tableId).DataTable({
    responsive: true,
    autoWidth: false,
    paging: true,
    searching: true,
    info: true,
    lengthMenu: [10, 25, 50, 100],
    language: {
      search:
        tableId === "#myDataTable" ? "Search Orders:" : "Search Products:",
      lengthMenu:
        tableId === "#myDataTable"
          ? "Show _MENU_ orders per page"
          : "Show _MENU_ products per page",
      info:
        tableId === "#myDataTable"
          ? "Showing _START_ to _END_ of _TOTAL_ orders"
          : "Showing _START_ to _END_ of _TOTAL_ products",
      infoFiltered:
        tableId === "#myDataTable"
          ? "(filtered from _MAX_ total orders)"
          : "(filtered from _MAX_ total products)",
      zeroRecords:
        tableId === "#myDataTable"
          ? "No matching orders found"
          : "No matching products found",
      emptyTable:
        tableId === "#myDataTable"
          ? "No orders available"
          : "No products available",
    },
    columnDefs:
      tableId === "#myDataTable"
        ? [{ targets: [-1, -3], className: "dt-body-right" }]
        : [],
  });
}

// Function to render Recent Orders
function renderRecentOrders(orders) {
  const tableBody = document.querySelector("#myDataTable tbody");
  let rows = "";

  if (orders.length === 0) {
    rows = `<tr><td colspan="4" class="text-center">No data available</td></tr>`;
  } else {
    orders.forEach((order) => {
    rows += `
            <tr>
              <td><a href="order-details.html?orderId=${
                order.order_id
              }"><strong>#Order-${order.order_id}</strong></a></td>
              <td>${order.user_name || "Unknown"}</td>
              <td>$${parseFloat(order.total_price).toFixed(2)}</td>
              <td>
                <span class="badge ${
                  order.status === "pending"
                    ? "bg-warning"
                    : order.status === "purchased"
                    ? "bg-primary"
                    : order.status === "under review"
                    ? "bg-info"
                    : order.status === "rejected"
                    ? "bg-danger"
                    : order.status === "shipped"
                    ? "bg-secondary"
                    : order.status === "delivered"
                    ? "bg-success"
                    : order.status === "returned"
                    ? "bg-dark"
                    : order.status === "canceled"
                    ? "bg-danger"
                    : order.status === "completed"
                    ? "bg-success"
                    : "bg-light"
                }">${order.status}</span>
              </td>
            </tr>
        `;
    });
  }

  tableBody.innerHTML = rows;
}
  

// Unified DOMContentLoaded Event
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("authToken");
  console.log("Auth Token:", token);

  // Fetch Dashboard Data
  fetch("http://35.234.135.60:5000/api/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      // Note: Sending tokens via cookies in client-side JS is not recommended for security reasons.
      // Consider handling authentication tokens using HTTP-only cookies set by the server.
      Cookie: `authToken=${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data.");
      }
      return response.json();
    })
    .then((data) => {
      // Populate numeric/stat fields
      $("#total_users").text(data.totalUsers);
      $("#active_users").text(data.activeUsers);
      $("#total_orders").text(data.totalOrders);
      $("#TotalSale").text(`$${parseFloat(data.totalRevenue).toFixed(2)}`);
      $("#AverageSale").text(`$${parseFloat(data.AverageSale).toFixed(2)}`);
      $("#avg_price").text(
        `$${parseFloat(data.getAvgPriceForOrders).toFixed(2)}`
      );
      $("#total_categories").text(data.totalCategories);
      $("#total_subcategories").text(data.totalSubCategories);
      $("#total_products").text(data.totalProducts);
      $("#total_packages").text(data.totalPackages);
      $("#total_active_offers").text(data.totalActiveOffers);
      $("#calculateGlobalAverageRating").text(
        parseFloat(data.calculateGlobalAverageRating).toFixed(2)
      );
      $("#avgCosts").text(`$${parseFloat(data.avgCosts).toFixed(2)}`);

      // Monthly earnings chart
      const monthlyEarnings = data.monthlyEarnings;
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const earningsData = months.map(
        (month) => parseFloat(monthlyEarnings[month]) || 0
      );

      updateChart(earningsData);

      // Render Recent Orders
      renderRecentOrders(data.recentOrders);
      // Initialize or reinitialize DataTables for Recent Orders
      initializeDataTable("#myDataTable");

      // Render Top Products
      renderTopProducts(data.topProducts);
      // Initialize or reinitialize DataTables for Top Products
      initializeDataTable("#topProductsTable");
    })
    .catch((error) => {
      console.error("Error fetching dashboard data:", error);
      // Optionally, display a global error message to the user
    });

    // Fetch Top Products
    function renderTopProducts(products) {
      const tableBody = document.querySelector("#topProductsTable tbody");
      let rows = "";

      if (products.length === 0) {
        rows = `<tr><td colspan="2" class="text-center">No data available</td></tr>`;
      } else {
        products.forEach((product) => {
          rows += `
            <tr>
              <td>${product.product_name}</td>
              <td>${product.total_quantity}</td>
            </tr>
          `;
        });
      }

      tableBody.innerHTML = rows;
    }
    
});
