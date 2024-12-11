const token = sessionStorage.getItem("authToken");
$(document).ready(function () {
  fetch("http://localhost:5000/api/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        cookie: 'authToken=' + sessionStorage.getItem("authToken"),
    },
    
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data.");
      }
      return response.json();
    })
    .then((data) => {
      $("#TotalSale").text(data.TotalSale);
      $("#active_users").text(data.activeUsers.active_users);
      $("#AverageSale").text(data.AverageSale);

      $("#total_users").text(data.totalUsers.total_users);
      $("#total_orders").text(data.totalOrders.total_orders);
      $("#total_categories").text(data.totalCategories.total_categories);
      $("#total_subcategories").text(
        data.totalSubCategories.total_subcategories
      );
      $("#total_products").text(data.totalProducts.total_products);
      $("#total_packages").text(data.totalPackages.total_packages);
      $("#total_active_offers").text(
        data.totalActiveOffers.total_active_offers
      );
      $("#calculateGlobalAverageRating").text(
        data.calculateGlobalAverageRating
      );
      $("#avgCosts").text(`$${data.avgCosts.toFixed(2)}`);

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
      const earningsData = months.map((month) => monthlyEarnings[month] || 0);

      updateChart(earningsData);
      let avgPrice = data.getAvgPriceForOrders.avg_price;
      let roundedAvgPrice = avgPrice.toFixed(2);
      $("#avg_price").text(roundedAvgPrice);
    })
    .catch((error) => {
      console.error(error.message);
    });
});

function updateChart(data) {
  var options = {
    series: [
      {
        name: "Costs",
        data: data,
      },
    ],
    chart: {
      height: 315,
      type: "bar",
      toolbar: {
        show: false,
      },
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
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
        formatter: function (val) {
          return val + "$";
        },
      },
    },
  };

  var chart = new ApexCharts(document.querySelector("#apex-expense"), options);
  chart.render();
}

document.addEventListener("DOMContentLoaded", () => {

    console.log("Auth Token:", sessionStorage.getItem("authToken"));

  const tableBody = document.querySelector("#myDataTable tbody");
  const apiUrl = "http://localhost:5000/api/orders/admin";

  // Fetch data from API
  fetch(apiUrl, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      cookie: 'authToken=' + sessionStorage.getItem("authToken"),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      renderTableData(data, tableBody);
      initializeDataTable();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Failed to load data</td></tr>`;
    });
});

function renderTableData(data, tableBody) {
  let rows = "";

  if (data.length === 0) {
    rows = `<tr><td colspan="4" class="text-center">No data available</td></tr>`;
  } else {
    data.forEach((order) => {
      rows += `
                <tr>
                    <td><a href="order-details.html?orderId=${
                      order.OrderID
                    }"><strong>#Order-${order.OrderID}</strong></a></td>
                    <td>${order.User ? order.User.Username : "Unknown"}</td>
                    <td>$${order.TotalPrice}</td>
                    <td>
                        <span class="badge ${
                          order.Status ? "bg-success" : "bg-danger"
                        }">
                            ${order.Status ? "Complete" : "Pending"}
                        </span>
                    </td>
                </tr>
            `;
    });
  }

  tableBody.innerHTML = rows;
}

// Initialize DataTables with search functionality
function initializeDataTable() {
  $("#myDataTable").DataTable({
    responsive: true,
    autoWidth: false,
    paging: true,
    searching: true,
    info: true,
    lengthMenu: [10, 25, 50, 100],
    columnDefs: [{ targets: [-1, -3], className: "dt-body-right" }],
    language: {
      search: "Search Orders:",
      lengthMenu: "Show _MENU_ orders per page",
      info: "Showing _START_ to _END_ of _TOTAL_ orders",
      infoFiltered: "(filtered from _MAX_ total orders)",
      zeroRecords: "No matching orders found",
      emptyTable: "No orders available",
    },
  });
}
